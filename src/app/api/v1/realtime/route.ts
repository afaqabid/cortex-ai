import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Redis } from "ioredis";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const orgId = session.session.activeOrganizationId;

  const encoder = new TextEncoder();
  const subRedis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

  const stream = new ReadableStream({
    async start(controller) {
      // Keep alive interval to prevent connection timeout
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("data: ping\n\n"));
        } catch (err) {
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      subRedis.on("message", (channel, message) => {
        try {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch (err) {
          console.error("SSE enqueue error:", err);
        }
      });

      // Subscribe to user and organization channels
      const channels = [`user:${userId}`];
      if (orgId) {
        channels.push(`org:${orgId}`);
      }
      await subRedis.subscribe(...channels);

      req.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        subRedis.unsubscribe();
        subRedis.quit();
        try {
          controller.close();
        } catch (e) {
          // Stream might be closed already
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
