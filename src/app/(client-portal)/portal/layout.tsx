import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, LogOut, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Fetch the membership to determine the user's role in this organization
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  const userRole = membership?.role || "CLIENT";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/portal" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">Client Hub</span>
            </Link>

            {/* If Admin/Owner/Manager, show back to Dashboard link */}
            {(userRole === "ADMIN" ||
              userRole === "OWNER" ||
              userRole === "MANAGER") && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold">{session.user.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {userRole.toLowerCase()} Portal
              </span>
            </div>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
