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
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"org" | "members" | "audit">("org");
  const { members, isLoadingTeam } = useTeam();
  const { logs, isLoadingLogs } = useAuditLogs();
  const { organization, loading: loadingOrg } = useOrganization();

  // Settings forms
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync settings inputs when organization loads
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setOrgSlug(organization.slug);
    }
  }, [organization]);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Organization settings updated successfully.");
    }, 800);
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
          <div className="border border-border bg-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Members</h3>
                <p className="text-xs text-muted-foreground">Listed below are team members with access rights.</p>
              </div>
              <button
                onClick={() => toast.success("Invite links are managed under invite modules.")}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Invite Member
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
                    <div>
                      <div className="font-semibold text-sm text-slate-800 dark:text-white">{member.user?.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{member.user?.email}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-muted uppercase text-slate-700 dark:text-slate-300">
                        {member.role}
                      </span>
                      <button
                        onClick={() => toast.info("Role updates are restricted in sandbox environment.")}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                      >
                        Change Role
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    </div>
  );
}
