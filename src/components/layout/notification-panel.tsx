"use client";

import { useEffect, useState, useRef } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BellOff, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    isPanelOpen,
    setNotifications,
    markAsRead,
    markAllAsRead,
    setPanelOpen,
  } = useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const trigger = document.getElementById("notification-bell-button");
        if (trigger && trigger.contains(event.target as Node)) {
          return;
        }
        setPanelOpen(false);
      }
    }

    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen, setPanelOpen]);

  // Fetch initial notifications
  useEffect(() => {
    async function fetchNotifications() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/v1/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isPanelOpen) {
      fetchNotifications();
    }
  }, [isPanelOpen, setNotifications]);

  // Handle marking a single notification as read
  const handleMarkAsRead = async (id: string) => {
    markAsRead(id);
    try {
      await fetch("/api/v1/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    const loadingToast = toast.loading("Marking all notifications as read...");
    markAllAsRead();
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        toast.success("All marked as read");
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Failed to update notifications");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  if (!isPanelOpen) return null;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden flex flex-col max-h-[480px]"
    >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground/60">
              <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                <BellOff className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const timeString = notification.createdAt
                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                : "";

              return (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  className={`p-4 transition-colors flex items-start gap-3 select-none ${
                    notification.read
                      ? "bg-card hover:bg-muted/10"
                      : "bg-brand-500/5 hover:bg-brand-500/10 border-l-2 border-brand-500"
                  } ${!notification.read ? "cursor-pointer" : ""}`}
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${notification.read ? "text-slate-700 dark:text-slate-300" : "text-brand-600 dark:text-brand-400 font-bold"}`}>
                        {notification.title}
                      </span>
                      <span className="text-[9px] text-muted-foreground shrink-0">
                        {timeString}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed break-words ${notification.read ? "text-muted-foreground" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
  );
}
