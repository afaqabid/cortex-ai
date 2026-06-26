"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { Loader2, Mail, CheckCircle2, XCircle, ArrowRight, ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const { data: session, isPending: isLoadingSession } = authClient.useSession();
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch invitation details
  useEffect(() => {
    async function loadInvitation() {
      if (isLoadingSession) return;

      // Better Auth getInvitation endpoint requires session to be logged in.
      // So if session is not active, we stop loading and show login prompt first.
      if (!session) {
        setIsLoadingInvite(false);
        return;
      }

      try {
        const { data, error } = await authClient.organization.getInvitation({
          query: {
            id: token,
          },
        });

        if (error) {
          setInviteError(error.message || "Failed to load invitation. It may be expired or already accepted.");
        } else {
          setInvitation(data);
        }
      } catch (err) {
        console.error("Fetch invitation error:", err);
        setInviteError("Something went wrong fetching invitation details.");
      } finally {
        setIsLoadingInvite(false);
      }
    }

    loadInvitation();
  }, [token, session, isLoadingSession]);

  const handleAccept = async () => {
    if (!invitation) return;
    setIsProcessing(true);

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      });

      if (error) {
        toast.error(error.message || "Failed to accept invitation");
        setIsProcessing(false);
        return;
      }

      toast.success("Joined organization successfully!");
      
      // Set active organization to the newly joined one
      await authClient.organization.setActive({
        organizationId: invitation.organizationId,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Accept invitation error:", err);
      toast.error("An unexpected error occurred while accepting the invitation.");
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!invitation) return;
    setIsProcessing(true);

    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId: invitation.id,
      });

      if (error) {
        toast.error(error.message || "Failed to reject invitation");
        setIsProcessing(false);
        return;
      }

      toast.info("Invitation rejected");
      router.push("/dashboard");
    } catch (err) {
      console.error("Reject invitation error:", err);
      toast.error("An unexpected error occurred while rejecting the invitation.");
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.info("Signed out successfully. Please log in with the correct account.");
  };

  const isEmailMismatch = invitation && session && 
    invitation.email.toLowerCase() !== session.user.email.toLowerCase();

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      owner: "Owner",
      admin: "Administrator",
      manager: "Manager",
      member: "Member",
      employee: "Employee",
      client: "Client",
    };
    return roles[role.toLowerCase()] || role;
  };

  if (isLoadingSession || isLoadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
        <div className="text-center space-y-4 relative z-10">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500 mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">Retrieving invitation details...</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative px-6 overflow-hidden">
        <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
        <div className="fixed inset-0 dot-pattern opacity-20 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl relative z-10 text-center space-y-6"
        >
          <div className="h-12 w-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">You've been invited!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To view and accept your invitation to join a Cortex AI workspace, you need to sign in or create an account first.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={`/login?redirectTo=/invite/${token}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-500/25 hover:bg-brand-600 transition-all"
            >
              Sign In to Accept
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/register?redirectTo=/invite/${token}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/50 hover:bg-accent px-6 py-3 text-sm font-medium transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error fetching invitation state
  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative px-6 overflow-hidden">
        <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl text-center space-y-6 relative z-10"
        >
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Invitation Error</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {inviteError}
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mismatch recipient email state
  if (isEmailMismatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative px-6 overflow-hidden">
        <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl text-center space-y-6 relative z-10"
        >
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Account Mismatch</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              This invitation was sent to <strong className="text-foreground">{invitation.email}</strong>.
            </p>
            <p>
              However, you are currently logged in as <strong className="text-foreground">{session.user.email}</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white px-6 py-3 text-sm font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out & Switch Account
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
            >
              Keep Using Current Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Valid invitation accept/reject state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative px-6 overflow-hidden">
      <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
      <div className="fixed inset-0 dot-pattern opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card/75 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center space-y-6">
          <div className="h-14 w-14 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Join Workspace</h2>
            <p className="text-sm text-muted-foreground">
              You've been invited by <strong className="text-foreground">{invitation.inviterEmail}</strong> to collaborate on:
            </p>
          </div>

          {/* Org details panel */}
          <div className="border border-border/80 bg-background/50 rounded-xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-semibold">Workspace Name</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {invitation.organizationName}
              </span>
            </div>
            <div className="border-t border-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-semibold">Invited Role</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2 py-0.5 rounded">
                {getRoleLabel(invitation.role)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span>Accepting as {session.user.email}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 rounded-xl border border-border bg-card/65 py-3 text-sm font-semibold hover:bg-accent text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Decline Invite
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-brand-500 text-white py-3 text-sm font-semibold shadow-xl shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/40 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Join Workspace"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
