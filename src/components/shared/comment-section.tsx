"use client";

import { useState } from "react";
import { useComments } from "@/hooks/queries/use-comments";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, Reply, CornerDownRight, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  entityType: "project" | "task" | "lead" | "document";
  entityId: string;
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { user } = useAuth();
  const {
    comments,
    isLoadingComments,
    createComment,
    deleteComment,
  } = useComments(entityType, entityId);

  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        entityType,
        entityId,
        content: newComment.trim(),
      });
      setNewComment("");
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        entityType,
        entityId,
        content: replyContent.trim(),
        parentId,
      });
      setReplyContent("");
      setReplyToId(null);
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const mainComments = comments.filter((c: any) => !c.parentId);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-brand-500" />
          Discussions ({comments.length})
        </h3>
      </div>

      {/* Main Comment Input */}
      <form onSubmit={handleSubmitComment} className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs shrink-0 select-none">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Comment
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {isLoadingComments ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          <p className="text-xs text-muted-foreground">Loading comments...</p>
        </div>
      ) : mainComments.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg bg-card/50">
          <p className="text-xs text-muted-foreground">No discussions yet. Be the first to start!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {mainComments.map((comment: any) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3 p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[10px] select-none">
                      {comment.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{comment.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {user?.id === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-xs pl-9 whitespace-pre-wrap leading-relaxed text-foreground/95">
                  {comment.content}
                </p>

                {/* Actions */}
                <div className="pl-9 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setReplyToId(replyToId === comment.id ? null : comment.id);
                      setReplyContent("");
                    }}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-brand-500 transition-colors cursor-pointer font-medium"
                  >
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyToId === comment.id && (
                  <div className="pl-9 flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 h-8 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      onClick={() => handlePostReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                      className="h-8 rounded-md bg-brand-500 px-3 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1"
                    >
                      Post
                    </button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-9 space-y-2 mt-2 pt-2 border-t border-border/40">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex gap-2.5 items-start">
                        <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-1" />
                        <div className="flex-1 bg-card/60 p-2.5 rounded-lg border border-border/50">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[8px] select-none">
                                {reply.user?.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <span className="text-[11px] font-semibold">{reply.user?.name}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {user?.id === reply.userId && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                className="p-0.5 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap pl-6">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
