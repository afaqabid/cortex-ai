"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useOrganization() {
  const { data: activeOrg, isPending: loadingActive, refetch } = authClient.useActiveOrganization();
  const { data: orgs, isPending: loadingOrgs } = authClient.useListOrganizations();
  const { data: activeMember, isPending: loadingMember } = authClient.useActiveMember();

  const organization = activeOrg || null;
  const list = orgs || [];
  const membership = activeMember || null;
  const role = membership?.role || null;

  useEffect(() => {
    if (!loadingActive && !loadingOrgs && !activeOrg && orgs && orgs.length > 0) {
      authClient.organization.setActive({
        organizationId: orgs[0].id,
      }).then(() => {
        refetch();
      });
    }
  }, [activeOrg, orgs, loadingActive, loadingOrgs, refetch]);

  const createOrganization = async (name: string, slug: string) => {
    return await authClient.organization.create({ name, slug });
  };

  const switchOrganization = async (organizationId: string) => {
    return await authClient.organization.setActive({ organizationId });
  };

  const inviteMember = async (email: string, role: "owner" | "admin" | "member") => {
    return await authClient.organization.inviteMember({
      email,
      role,
    });
  };

  return {
    organization,
    organizations: list,
    membership,
    role,
    loading: loadingActive || loadingOrgs || loadingMember,
    createOrganization,
    switchOrganization,
    inviteMember,
    refetch,
  };
}
