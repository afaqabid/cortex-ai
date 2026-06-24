"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
  Loader2,
  AlertCircle,
  HelpCircle,
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

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am your Cortex AI Assistant. I have secure access to your organization's business metrics. 

How can I help you operate your workspace today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleToolData = (messageId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const streamResponse = (messageId: string, fullText: string, finalMessage: Message) => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < fullText.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: fullText.slice(0, currentIdx + 1) }
              : msg
          )
        );
        currentIdx += 2; // speed up stream slightly
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isStreaming: false, content: fullText }
              : msg
          )
        );
      }
    }, 20);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const newMessages: Message[] = [
      ...messages,
      { id: userMessageId, role: "user", content: textToSend },
    ];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          isStreaming: true,
          toolUsed: data.toolUsed,
          toolData: data.toolData,
        },
      ]);

      streamResponse(assistantMessageId, data.text, data);
    } catch (err) {
      toast.error("Failed to query assistant");
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "Sorry, I encountered an error communicating with the AI service. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear this conversation?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I am your Cortex AI Assistant. I have secure access to your organization's business metrics. 

How can I help you operate your workspace today?`,
        },
      ]);
      setExpandedTools({});
    }
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
            Ask questions, retrieve workspace reports, and trigger operational services.
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
                      <div className="whitespace-pre-line">{msg.content}</div>

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
                              {/* If CRM */}
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

                              {/* If Projects */}
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

                              {/* If Analytics */}
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

                              {/* If Documents */}
                              {msg.toolUsed === "searchDocuments" && Array.isArray(msg.toolData) && (
                                <div className="space-y-1">
                                  {msg.toolData.map((doc: any) => (
                                    <div key={doc.id} className="truncate">
                                      📄 <span className="font-semibold">{doc.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* If Team */}
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
            {isLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-indigo-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-3.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  Assistant is analyzing organization data...
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
                placeholder="Ask about leads, active project details, collections metrics..."
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
