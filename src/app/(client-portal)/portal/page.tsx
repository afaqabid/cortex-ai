import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";
import {
  Briefcase,
  Receipt,
  FileText,
  CheckCircle2,
  Hourglass,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function PortalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const organizationId = await getOrCreateActiveOrgId(
    session.user.id,
    session.user.name,
    session.session.activeOrganizationId
  );

  // Find Client matching email
  let client = await prisma.client.findFirst({
    where: {
      email: session.user.email,
      organizationId,
    },
  });

  // Fallback to first available client for previewing (e.g. if admin logs in)
  let isDemoView = false;
  if (!client) {
    client = await prisma.client.findFirst({
      where: { organizationId },
    });
    if (client) {
      isDemoView = true;
    }
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card border border-border rounded-2xl">
        <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold">No Client Profile Found</h2>
        <p className="text-muted-foreground text-sm max-w-md mt-2">
          Your account is not associated with an active client workspace. Please contact support or your account administrator to link your account.
        </p>
      </div>
    );
  }

  // Fetch client projects
  const projects = await prisma.project.findMany({
    where: {
      clientId: client.id,
      organizationId,
    },
    include: {
      milestones: {
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch client invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      clientId: client.id,
      organizationId,
    },
    orderBy: { issueDate: "desc" },
  });

  // Fetch shared documents
  const documents = await prisma.document.findMany({
    where: {
      organizationId,
      isPublished: true,
    },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "OVERDUE":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "SENT":
      case "VIEWED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner / Info */}
      {isDemoView && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs px-4 py-2.5 rounded-xl">
          <strong>Preview Mode:</strong> You are viewing this workspace as client <strong>{client.name}</strong> ({client.company || "No Company"}).
        </div>
      )}

      {/* Hero Greeting */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {client.name}
        </h1>
        <p className="text-indigo-200 text-sm mt-1.5 max-w-xl">
          Track milestones, view billing statements, and access shared documents directly from your personalized client panel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Projects Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Active Projects
            </h2>
            <span className="px-2 py-0.5 rounded border text-xs font-semibold text-muted-foreground">{projects.length} Total</span>
          </div>

          {projects.length === 0 ? (
            <div className="border border-border rounded-xl p-8 text-center text-muted-foreground text-sm bg-card">
              No projects assigned to your account yet.
            </div>
          ) : (
            projects.map((project) => {
              const completedMilestones = project.milestones.filter(m => m.completed).length;
              const progressPercent = project.milestones.length
                ? Math.round((completedMilestones / project.milestones.length) * 100)
                : 0;

              return (
                <div key={project.id} className="border border-border rounded-xl bg-card hover:shadow-md transition-all">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{project.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {project.description || "No description provided."}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted capitalize">{project.status.toLowerCase()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Milestones Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    {project.milestones.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Key Milestones
                        </h4>
                        <div className="space-y-1.5">
                          {project.milestones.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {m.completed ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Hourglass className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                                )}
                                <span className={m.completed ? "line-through text-muted-foreground" : "font-medium text-slate-800 dark:text-slate-150"}>
                                  {m.name}
                                </span>
                              </div>
                              {m.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(m.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar: Invoices + Shared Docs */}
        <div className="space-y-6">
          {/* Billing / Invoices */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-500" />
              Invoices
            </h2>

            {invoices.length === 0 ? (
              <div className="border border-border rounded-xl p-6 text-center text-muted-foreground text-xs bg-card">
                No invoices available.
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="border border-border bg-card rounded-xl hover:shadow-sm transition-all">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{inv.number}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{formatCurrency(inv.total)}</div>
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 capitalize ${getInvoiceStatusColor(
                            inv.status
                          )}`}
                        >
                          {inv.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared Documents */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Guidelines & Resources
            </h2>

            {documents.length === 0 ? (
              <div className="border border-border rounded-xl p-6 text-center text-muted-foreground text-xs bg-card">
                No guidelines shared yet.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-border bg-card rounded-xl hover:shadow-sm transition-all">
                    <div className="p-4 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <div className="font-semibold text-sm truncate">{doc.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Link
                        href={`/knowledge/${doc.id}`}
                        className="flex items-center justify-center shrink-0 h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-slate-800 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
