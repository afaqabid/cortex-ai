"use client";

import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";

export function useAuth() {
  const { data: sessionData, isPending: loading, error, refetch } = useSession();

  const user = sessionData?.user || null;
  const session = sessionData?.session || null;
  const isAuthenticated = !!session;

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refetch,
  };
}
