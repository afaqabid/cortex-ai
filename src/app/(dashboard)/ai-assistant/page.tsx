"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  toolUsed?: string | null;
  toolData?: any;
}

const SUGGESTED_PROMPTS = [
  { label: "CRM Leads Summary", text: "Show my top CRM leads" },
  { label: "Active Project Workloads", text: "Show active projects and milestones" },
  { label: "Invoice Collections Overview", text: "What is our billing and collections status?" },
  { label: "Knowledge Resources", text: "Find guidelines and resources in the knowledge base" },
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hello! I'm your **Cortex AI Assistant**, powered by Google Gemini. I have secure access to your organization's live data.\n\nI can help you with:\n- 📊 **CRM Leads** — search and summarize your sales pipeline\n- 📁 **Projects** — view active projects, milestones, and tasks\n- 💰 **Invoices** — check billing, revenue, and collections\n- 📖 **Knowledge Base** — find published guides and documents\n- 👥 **Team** — see who's in your organization\n\nHow can I help you today?`,
};

// ── Simple Markdown Renderer ──────────────────────────────────
function renderMarkdown(text: string) {
  // Process the text line by line for block-level elements
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line = spacing
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold mt-2 mb-1">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-bold mt-2 mb-1">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Bullet lists
    if (line.match(/^[-*]\s/)) {
      elements.push(
        <div key={i} className="flex gap-2 pl-2">
          <span className="text-muted-foreground shrink-0">•</span>
          <span>{renderInline(line.replace(/^[-*]\s/, ""))}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={i} className="flex gap-2 pl-2">
          <span className="text-muted-foreground shrink-0 font-medium">{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

// Inline markdown: **bold**, *italic*, `code`, ~~strikethrough~~
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // regex: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={match.index}
          className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono"
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// ── Main Component ────────────────────────────────────────────
export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleToolData = (messageId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleSend = useCallback(
    async (textToSend: string) => {
      if (!textToSend.trim() || isLoading) return;

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      // Add user message
      const updatedMessages: Message[] = [
        ...messages,
        { id: userMessageId, role: "user", content: textToSend },
      ];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          isStreaming: true,
        },
      ]);

      try {
        // Build messages array for the API (exclude welcome message and streaming flags)
        const apiMessages = updatedMessages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content }));

        abortRef.current = new AbortController();

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to get response");
        }

        // ── Read SSE Stream ──────────────────────────────────
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();

            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "tool") {
                // Update assistant message with tool info
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, toolUsed: parsed.toolUsed, toolData: parsed.toolData }
                      : msg
                  )
                );
              } else if (parsed.type === "content") {
                // Append streamed content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + parsed.content }
                      : msg
                  )
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          )
        );
      } catch (err: any) {
        if (err.name === "AbortError") return;

        toast.error(err.message || "Failed to query assistant");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  isStreaming: false,
                  content:
                    "Sorry, I encountered an error. Please check your Gemini API key is set correctly in `.env.local` and try again.",
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading]
  );

  const clearChat = () => {
    // Abort any in-flight request
    abortRef.current?.abort();
    setMessages([WELCOME_MESSAGE]);
    setExpandedTools({});
    setIsLoading(false);
  };

  const getToolDisplayName = (toolName: string) => {
    switch (toolName) {
      case "searchCRM":
        return "Prisma CRM Lookup (searchCRM)";
      case "getProjects":
        return "Workspace Project Fetcher (getProjects)";
      case "getAnalytics":
        return "Billing Analytics Aggregator (getAnalytics)";
      case "searchDocuments":
        return "Knowledge Vector Search (searchDocuments)";
      case "getTeamWorkload":
        return "Staff Capacity Query (getTeamWorkload)";
      default:
        return toolName;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 fill-indigo-500/10" />
            AI Assistant
          </h1>
          <p className="text-xs text-muted-foreground">
            Powered by Google Gemini · Ask questions, retrieve workspace reports, and get intelligent insights.
          </p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 px-2 py-1.5 rounded-lg border border-border transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Conversation
        </button>
      </div>

      {/* Main chat window container */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        {/* Messages Pane */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isExpanded = expandedTools[msg.id] || false;

              return (
                <div key={msg.id} className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm ${
                      isUser ? "bg-slate-700" : "bg-indigo-600"
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-2 max-w-[85%]">
                    <div
                      className={`rounded-xl p-3.5 text-sm leading-relaxed ${
                        isUser
                          ? "bg-slate-800 text-white"
                          : "bg-slate-50 dark:bg-slate-900 border border-border text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <div className="space-y-1">
                        {isUser ? (
                          <div className="whitespace-pre-line">{msg.content}</div>
                        ) : (
                          renderMarkdown(msg.content)
                        )}

                        {/* Streaming cursor */}
                        {msg.isStreaming && msg.content.length > 0 && (
                          <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse rounded-sm ml-0.5 align-text-bottom" />
                        )}
                      </div>

                      {/* Tool call executed indicator */}
                      {!isUser && msg.toolUsed && (
                        <div className="mt-3 border-t border-border/80 pt-2 space-y-2">
                          <button
                            onClick={() => toggleToolData(msg.id)}
                            className="flex items-center justify-between w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Terminal className="h-3.5 w-3.5 shrink-0" />
                              {getToolDisplayName(msg.toolUsed)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </span>
                          </button>

                          {/* Expanded Tool Data details */}
                          {isExpanded && msg.toolData && (
                            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-lg p-2.5 overflow-x-auto text-[11px] font-mono border border-border text-slate-700 dark:text-slate-300">
                              {/* CRM leads */}
                              {msg.toolUsed === "searchCRM" && Array.isArray(msg.toolData) && (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-border">
                                      <th className="pb-1 pr-2">Name</th>
                                      <th className="pb-1 pr-2">Company</th>
                                      <th className="pb-1 pr-2">Status</th>
                                      <th className="pb-1">Score</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {msg.toolData.map((lead: any) => (
                                      <tr key={lead.id} className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                                        <td className="py-1 pr-2 font-semibold">{lead.name}</td>
                                        <td className="py-1 pr-2">{lead.company || "—"}</td>
                                        <td className="py-1 pr-2 text-xs uppercase">{lead.status}</td>
                                        <td className="py-1">{lead.score}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}

                              {/* Projects */}
                              {msg.toolUsed === "getProjects" && Array.isArray(msg.toolData) && (
                                <div className="space-y-2">
                                  {msg.toolData.map((project: any) => (
                                    <div key={project.id} className="border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                                      <div className="flex justify-between font-semibold">
                                        <span>{project.name}</span>
                                        <span className="uppercase text-[10px]">{project.status}</span>
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">
                                        Milestones: {project.milestones?.length || 0} | Tasks: {project._count?.tasks || 0}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Analytics */}
                              {msg.toolUsed === "getAnalytics" && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Total Invoiced</span>
                                    <span className="font-bold">${msg.toolData.totalBilled?.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-[10px]">Total Collected</span>
                                    <span className="font-bold text-emerald-500">${msg.toolData.totalCollected?.toLocaleString()}</span>
                                  </div>
                                  <div className="col-span-2 text-muted-foreground text-[10px] border-t border-border/40 pt-1 mt-1">
                                    Computed across {msg.toolData.invoiceCount} total invoices.
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              {msg.toolUsed === "searchDocuments" && Array.isArray(msg.toolData) && (
                                <div className="space-y-1">
                                  {msg.toolData.map((doc: any) => (
                                    <div key={doc.id} className="truncate">
                                      📄 <span className="font-semibold">{doc.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Team */}
                              {msg.toolUsed === "getTeamWorkload" && Array.isArray(msg.toolData) && (
                                <div className="space-y-1">
                                  {msg.toolData.map((m: any) => (
                                    <div key={m.id} className="flex justify-between">
                                      <span className="font-semibold">{m.user?.name}</span>
                                      <span className="text-muted-foreground text-[10px]">{m.user?.email}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Waiting indicator */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-3 max-w-xl">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-indigo-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-3.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  Thinking and querying organization data...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts Block */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 pt-4 border-t border-border/60">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Suggested Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handleSend(prompt.text)}
                    className="text-left p-2.5 rounded-lg border border-border hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input */}
          <div className="p-4 border-t border-border bg-muted/20 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about leads, projects, invoices, team members..."
                className="flex-1 bg-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/15"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
