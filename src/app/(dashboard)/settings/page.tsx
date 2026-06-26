"use client";

import { useState, useEffect } from "react";
import { useTeam } from "@/hooks/queries/use-team";
import { useAuditLogs } from "@/hooks/queries/use-audit";
import { useOrganization } from "@/hooks/use-organization";
import {
  Settings,
  Users,
  ShieldAlert,
  Building,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  Plus,
  Trash2,
  X,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"org" | "members" | "audit">("org");
  const { members, isLoadingTeam, refetch: refetchTeam } = useTeam();
  const { logs, isLoadingLogs } = useAuditLogs();
  const { organization, loading: loadingOrg, refetch, role } = useOrganization();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  // Settings forms
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Invite Member form
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EMPLOYEE");
  const [isInviting, setIsInviting] = useState(false);

  // Revoke invitation modal state
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const { error } = await authClient.organization.inviteMember({
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole as any,
      });

      if (error) {
        toast.error(error.message || "Failed to send invitation");
      } else {
        toast.success("Invitation sent successfully!");
        setIsInviteOpen(false);
        setInviteEmail("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while sending the invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvite = (invitationId: string) => {
    setRevokeTarget(invitationId);
  };

  const rolesList = Object.entries(ROLE_LABELS).filter(([role]) => role !== "OWNER");
  const invitations = (organization as any)?.invitations || [];
  const pendingInvites = invitations.filter((invite: any) => invite.status.toLowerCase() === "pending");
  const inactiveInvites = invitations.filter((invite: any) => {
    const status = invite.status.toLowerCase();
    return status === "canceled" || status === "cancelled" || status === "rejected";
  });

  // Sync settings inputs when organization loads
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setOrgSlug(organization.slug);
    }
  }, [organization]);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setIsSaving(true);
    try {
      const { error } = await authClient.organization.update({
        organizationId: organization.id,
        data: {
          name: orgName,
          slug: orgSlug,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to update organization settings");
      } else {
        toast.success("Organization settings updated successfully.");
        await refetch();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating organization settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const getPlanName = () => {
    if (!organization) return "Free";
    const orgAny = organization as any;
    return orgAny.plan || orgAny.metadata?.plan || "Free";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Settings & Workspace Controls
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization structure, member roles, security credentials, and system audit trails.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-border pb-px shrink-0">
        <button
          onClick={() => setActiveTab("org")}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "org"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="h-4 w-4" />
          Organization Profile
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "members"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Members & Roles
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 pb-2 px-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "audit"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          System Audit Logs
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* Tab 1: Org profile */}
        {activeTab === "org" && (
          <div className="space-y-6 max-w-2xl">
            <div className="border border-border bg-card rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Information</h3>
              {loadingOrg ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={handleSaveOrg} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Organization Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Workspace Slug (URL)</label>
                    <div className="flex rounded-lg overflow-hidden border border-input bg-background focus-within:ring-2 focus-within:ring-indigo-600">
                      <span className="bg-muted px-3 py-1.5 text-xs text-muted-foreground select-none border-r border-input">
                        cortex-ai.com/
                      </span>
                      <input
                        type="text"
                        required
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </form>
              )}
            </div>

            <div className="border border-border bg-card rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subscription Plan</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Workspace is currently on the Pro trial bundle.</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 rounded border border-brand-500/20">
                  {getPlanName()}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  Next billing date: July 24, 2026
                </span>
                <button
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  onClick={() => toast.info("Billing portal configuration is managed by stripe setup.")}
                >
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="border border-border bg-card rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Members</h3>
                  <p className="text-xs text-muted-foreground">Listed below are team members with access rights.</p>
                </div>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Invite Member
                </button>
              </div>

              {isLoadingTeam ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map((member: any) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm shrink-0 select-none">
                          {member.user?.name?.[0]?.toUpperCase() || <Users className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{member.user?.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{member.user?.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {role === "OWNER" && member.role !== "OWNER" && member.userId !== session?.user?.id ? (
                          <select
                            value={member.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              const loadingToast = toast.loading("Updating member role...");
                              try {
                                const { error } = await authClient.organization.updateMemberRole({
                                  memberId: member.id,
                                  role: newRole as any,
                                });
                                if (error) {
                                  toast.error(error.message || "Failed to update member role");
                                } else {
                                  toast.success("Role updated successfully!");
                                  if (refetchTeam) await refetchTeam();
                                  router.refresh();
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error("Failed to update role");
                              } finally {
                                toast.dismiss(loadingToast);
                              }
                            }}
                            className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 cursor-pointer"
                          >
                            {rolesList.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-muted uppercase text-slate-700 dark:text-slate-300">
                            {ROLE_LABELS[member.role] || member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Invitations */}
            <div className="border border-border bg-card rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Invitations</h3>
                <p className="text-xs text-muted-foreground">Invitations sent to team members who haven't accepted yet.</p>
              </div>

              {pendingInvites.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No pending invitations.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingInvites.map((invite: any) => (
                    <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm shrink-0 select-none">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{invite.email}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-muted uppercase text-slate-700 dark:text-slate-300">
                          {ROLE_LABELS[invite.role] || invite.role}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize bg-amber-500/10 text-amber-500 border-amber-500/20">
                          {invite.status}
                        </span>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Canceled & Rejected Invitations */}
            <div className="border border-border bg-card rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Canceled & Rejected Invitations</h3>
                <p className="text-xs text-muted-foreground">Historical records of invitations that were revoked or declined.</p>
              </div>

              {inactiveInvites.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No canceled or rejected invitations.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {inactiveInvites.map((invite: any) => (
                    <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm shrink-0 select-none">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{invite.email}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Created: {new Date(invite.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-muted uppercase text-slate-700 dark:text-slate-300">
                          {ROLE_LABELS[invite.role] || invite.role}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize bg-red-500/10 text-red-500 border-red-500/20">
                          {invite.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: System Audit Logs */}
        {activeTab === "audit" && (
          <div className="border border-border bg-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Operation Audit Trails</h3>
              <p className="text-xs text-muted-foreground">Immutable historical trail of workspace operations.</p>
            </div>

            {isLoadingLogs ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No system action logs registered in this organization.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Module</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-muted/10">
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{log.user?.name}</div>
                          <div className="text-[10px] text-muted-foreground">{log.user?.email}</div>
                        </td>
                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">{log.action}</td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 capitalize">{log.entityType}</td>
                        <td className="p-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Member Dialog Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border p-6 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Invite New Member</h3>
                <button
                  onClick={() => setIsInviteOpen(false)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Workspace Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  >
                    {rolesList.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="flex-1 rounded-lg border border-input bg-background py-2 text-sm font-semibold hover:bg-accent transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting || !inviteEmail}
                    className="flex-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold shadow-lg hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isInviting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {revokeTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevokeTarget(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="w-full max-w-sm bg-card border border-border rounded-xl p-5 shadow-2xl pointer-events-auto relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revoke Invitation</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Are you sure you want to revoke this invitation? The recipient will no longer be able to use the link to join the organization.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    onClick={() => setRevokeTarget(null)}
                    disabled={isRevoking}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!revokeTarget) return;
                      setIsRevoking(true);
                      try {
                        const { error } = await authClient.organization.cancelInvitation({
                          invitationId: revokeTarget,
                        });
                        if (error) {
                          toast.error(error.message || "Failed to cancel invitation");
                        } else {
                          toast.success("Invitation revoked successfully!");
                          setRevokeTarget(null);
                          router.refresh();
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to revoke invitation.");
                      } finally {
                        setIsRevoking(false);
                      }
                    }}
                    disabled={isRevoking}
                    className="flex items-center gap-1 rounded-lg bg-red-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isRevoking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Revoke
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
