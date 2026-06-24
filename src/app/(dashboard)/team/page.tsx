"use client";

import { useTeam } from "@/hooks/queries/use-team";
import { motion } from "framer-motion";
import { Shield, Mail, User, ShieldCheck, Loader2 } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

export default function TeamPage() {
  const { members, isLoadingTeam } = useTeam();

  const getRoleIcon = (role: string) => {
    if (role === "OWNER" || role === "ADMIN") {
      return <ShieldCheck className="h-4 w-4 text-brand-500" />;
    }
    return <Shield className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground mt-1">
          Manage and collaborate with team members in your organization.
        </p>
      </div>

      {isLoadingTeam ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Loading team members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">No team members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member: any, i: number) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border bg-card p-5 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm shrink-0 select-none">
                  {member.user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{member.user?.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {getRoleIcon(member.role)}
                    <span className="font-medium">
                      {(ROLE_LABELS as any)[member.role] || member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.user?.email}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
