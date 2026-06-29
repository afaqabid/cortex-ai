"use client";

import { useState } from "react";
import { useTeam } from "@/hooks/queries/use-team";
import { usePermissions } from "@/hooks/use-permissions";
import { useOrganization } from "@/hooks/use-organization";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { 
  Shield, 
  Mail, 
  User, 
  ShieldCheck, 
  Loader2, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { toast } from "sonner";

export default function TeamPage() {
  const { data: session } = authClient.useSession();
  const { checkPermission } = usePermissions();
  const { members, isLoadingTeam, refetch: refetchTeam } = useTeam();

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSavingRole, setIsSavingRole] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null);

  const canManage = checkPermission("members:manage");

  const getRoleIcon = (role: string) => {
    if (role === "OWNER" || role === "ADMIN") {
      return <ShieldCheck className="h-4 w-4 text-brand-500" />;
    }
    return <Shield className="h-4 w-4 text-muted-foreground" />;
  };

  const handleStartEdit = (member: any) => {
    setEditingMemberId(member.id);
    setSelectedRole(member.role);
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setSelectedRole("");
  };

  const handleSaveRole = async (memberId: string) => {
    setIsSavingRole(memberId);
    const loadingToast = toast.loading("Updating team member's role...");
    try {
      const { error } = await authClient.organization.updateMemberRole({
        memberId,
        role: selectedRole as any,
      });

      if (error) {
        toast.error(error.message || "Failed to update role");
      } else {
        toast.success("Role updated successfully!");
        setEditingMemberId(null);
        setSelectedRole("");
        await refetchTeam();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    } finally {
      setIsSavingRole(null);
      toast.dismiss(loadingToast);
    }
  };

  const handleRemoveMember = async (member: any) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${member.user?.name || "this member"} from the organization?`
    );
    if (!confirmRemove) return;

    setIsRemovingMember(member.id);
    const loadingToast = toast.loading("Removing member...");
    try {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: member.id,
      });

      if (error) {
        toast.error(error.message || "Failed to remove member");
      } else {
        toast.success("Member removed successfully!");
        await refetchTeam();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    } finally {
      setIsRemovingMember(null);
      toast.dismiss(loadingToast);
    }
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
          {members.map((member: any, i: number) => {
            const isSelf = member.userId === session?.user?.id;
            const isTargetAdmin = member.role === "OWNER" || member.role === "ADMIN";
            const canModifyMember = canManage && !isSelf && !isTargetAdmin;
            const isEditingThisMember = editingMemberId === member.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-border bg-card p-5 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                {/* Action Buttons for Managing Member */}
                {canModifyMember && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                    {isEditingThisMember ? (
                      <>
                        <button
                          onClick={() => handleSaveRole(member.id)}
                          disabled={isSavingRole === member.id}
                          className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-600 dark:hover:bg-green-500/20 transition-colors cursor-pointer"
                          title="Save"
                        >
                          {isSavingRole === member.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-500 dark:hover:bg-slate-500/20 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(member)}
                          className="p-1.5 rounded-lg hover:bg-brand-500/10 text-brand-600 dark:hover:bg-brand-500/20 transition-colors cursor-pointer"
                          title="Edit Role"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={isRemovingMember === member.id}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Remove Member"
                        >
                          {isRemovingMember === member.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm shrink-0 select-none">
                    {member.user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1 min-w-0 pr-16">
                    <h3 className="text-sm font-semibold truncate">{member.user?.name}</h3>
                    
                    {isEditingThisMember ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="h-7 mt-1.5 rounded-md border border-input bg-background px-2 py-0.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 cursor-pointer"
                      >
                        {Object.entries(ROLE_LABELS)
                          .filter(([r]) => r !== "OWNER" && r !== "ADMIN")
                          .map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getRoleIcon(member.role)}
                        <span className="font-medium">
                          {(ROLE_LABELS as any)[member.role] || member.role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{member.user?.email}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
