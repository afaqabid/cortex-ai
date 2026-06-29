import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";
import { genAI } from "@/lib/gemini";
import { SchemaType } from "@google/generative-ai";

// ── System Prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Cortex AI Assistant — a helpful, concise workspace assistant for the Cortex AI platform.
You have access to the organization's real data through tools. When the user asks about leads, projects, invoices, knowledge base docs, or team members, use the appropriate tool to fetch live data and summarize it clearly.

Formatting rules:
- Use markdown for formatting (bold, lists, tables).
- Be concise but informative.
- When showing data from tools, present it in a well-organized way.
- If no tool is needed (e.g. greetings, general questions), respond conversationally.
- Always be professional and helpful.`;

// ── Tool Definitions (Gemini Function Calling) ─────────────────
const toolDeclarations = [
  {
    name: "searchCRM",
    description:
      "Search CRM leads. Returns the top leads sorted by score. Use when the user asks about leads, sales, CRM, pipeline, or prospects.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Optional search keyword to filter leads by name or company",
        },
      },
    },
  },
  {
    name: "getProjects",
    description:
      "Get active projects with their milestones and task counts. Use when the user asks about projects, milestones, tasks, or workload.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "getAnalytics",
    description:
      "Calculate billing and revenue analytics from invoices. Use when the user asks about invoices, billing, revenue, collections, payments, or money.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "searchDocuments",
    description:
      "Search the knowledge base for published documents and guidelines. Use when the user asks about documents, knowledge base, guides, or resources.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Optional search keyword to filter documents by title",
        },
      },
    },
  },
  {
    name: "getTeamWorkload",
    description:
      "List team members in the organization with their roles. Use when the user asks about team, members, staff, employees, or who is on the team.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
];

// ── Tool Execution ─────────────────────────────────────────────
async function executeTool(
  name: string,
  args: Record<string, any>,
  organizationId: string
): Promise<any> {
  switch (name) {
    case "searchCRM": {
      const where: any = { organizationId };
      if (args.query) {
        where.OR = [
          { name: { contains: args.query, mode: "insensitive" } },
          { company: { contains: args.query, mode: "insensitive" } },
        ];
      }
      return await prisma.lead.findMany({
        where,
        take: 10,
        orderBy: { score: "desc" },
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          status: true,
          score: true,
          source: true,
        },
      });
    }

    case "getProjects": {
      return await prisma.project.findMany({
        where: { organizationId },
        include: {
          milestones: {
            select: { id: true, name: true, completed: true, dueDate: true },
          },
          _count: { select: { tasks: true } },
        },
        take: 10,
        orderBy: { updatedAt: "desc" },
      });
    }

    case "getAnalytics": {
      const invoices = await prisma.invoice.findMany({
        where: { organizationId },
        select: { status: true, total: true },
      });
      let totalBilled = 0;
      let totalCollected = 0;
      let totalPending = 0;
      let totalOverdue = 0;
      invoices.forEach((inv) => {
        totalBilled += inv.total;
        if (inv.status === "PAID") totalCollected += inv.total;
        if (inv.status === "SENT" || inv.status === "DRAFT") totalPending += inv.total;
        if (inv.status === "OVERDUE") totalOverdue += inv.total;
      });
      return {
        totalBilled,
        totalCollected,
        totalPending,
        totalOverdue,
        invoiceCount: invoices.length,
        paidCount: invoices.filter((i) => i.status === "PAID").length,
        pendingCount: invoices.filter((i) => i.status !== "PAID").length,
      };
    }

    case "searchDocuments": {
      const docWhere: any = { organizationId, isPublished: true };
      if (args.query) {
        docWhere.title = { contains: args.query, mode: "insensitive" };
      }
      return await prisma.document.findMany({
        where: docWhere,
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          updatedAt: true,
        },
      });
    }

    case "getTeamWorkload": {
      return await prisma.member.findMany({
        where: { organizationId },
        include: {
          user: { select: { name: true, email: true } },
        },
        take: 20,
      });
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── POST Handler ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const organizationId = await getOrCreateActiveOrgId(
      session.user.id,
      session.user.name,
      session.session.activeOrganizationId
    );

    const body = await req.json();
    const { messages: clientMessages } = body;

    if (!clientMessages || !Array.isArray(clientMessages) || clientMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build Gemini chat history from client messages
    // Gemini expects alternating user/model roles
    const history: { role: string; parts: { text: string }[] }[] = [];
    for (let i = 0; i < clientMessages.length - 1; i++) {
      const msg = clientMessages[i];
      history.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // The last message is the current user input
    const lastMessage = clientMessages[clientMessages.length - 1];
    const userInput = lastMessage.content;

    // Create the model with tools and system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: toolDeclarations as any }],
    });

    // Start a chat session
    const chat = model.startChat({ history });

    // ── First call: let Gemini decide if it needs tools ────────
    const firstResult = await chat.sendMessage(userInput);
    const firstResponse = firstResult.response;
    const firstCandidate = firstResponse.candidates?.[0];

    if (!firstCandidate) {
      throw new Error("No response from Gemini");
    }

    // Check if Gemini wants to call a function
    const functionCall = firstCandidate.content.parts.find(
      (part) => "functionCall" in part
    );

    let toolUsed: string | null = null;
    let toolData: any = null;

    if (functionCall && functionCall.functionCall) {
      const { name, args } = functionCall.functionCall;
      toolUsed = name;

      // Execute the tool
      toolData = await executeTool(name, args || {}, organizationId);

      // Send the function result back to Gemini
      const secondResult = await chat.sendMessageStream([
        {
          functionResponse: {
            name,
            response: { data: toolData },
          },
        },
      ]);

      // Stream the final response
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          // Send tool metadata first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "tool", toolUsed, toolData })}\n\n`
            )
          );

          for await (const chunk of secondResult.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "content", content: text })}\n\n`
                )
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── No tools needed: stream the direct response ────────────
    // For non-tool responses, we need to re-send with streaming
    // since the first call was non-streaming
    const directText = firstResponse.text();

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        // Send the full text as a single content event
        if (directText) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "content", content: directText })}\n\n`
            )
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("POST AI chat error:", error);

    // Handle Gemini-specific errors
    if (error?.message?.includes("API key")) {
      return new Response(
        JSON.stringify({
          error: "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (error?.status === 429 || error?.message?.includes("quota")) {
      return new Response(
        JSON.stringify({
          error: "Gemini rate limit reached. Please try again in a moment.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
