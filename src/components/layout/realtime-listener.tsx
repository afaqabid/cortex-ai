"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/lib/constants";
import { useNotificationStore } from "@/stores/notification-store";
import { useRouter } from "next/navigation";

export function RealtimeListener() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!session) return;

    const lastProcessedTimes = new Map<string, number>();
    const eventSource = new EventSource("/api/v1/realtime");

    eventSource.onmessage = (event) => {
      if (event.data === "ping") return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "role_updated") {
          const eventKey = `${data.userId}-${data.newRole}`;
          const lastTime = lastProcessedTimes.get(eventKey) || 0;
          const now = Date.now();

          if (now - lastTime < 4000) {
            // Deduplicate: ignore if we already processed this role change for this user in the last 4 seconds
            return;
          }
          lastProcessedTimes.set(eventKey, now);

          // If the role update is for the currently logged-in user
          if (data.userId === session.user.id) {
            const roleName = ROLE_LABELS[data.newRole] || data.newRole;
            toast.info(`Your role has been updated to: ${roleName}`, {
              duration: 6000,
            });

            // Insert new notification record dynamically
            if (data.notification) {
              addNotification(data.notification);
            }

            // Force a router refresh to sync layouts/permissions
            router.refresh();
          }

          // Broadcast a custom event to notify components (e.g. the Team page)
          window.dispatchEvent(
            new CustomEvent("team-member-updated", {
              detail: data,
            })
          );
        }
      } catch (err) {
        console.error("Failed to parse realtime event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Realtime EventSource error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [session, router]);

  return null;
}
