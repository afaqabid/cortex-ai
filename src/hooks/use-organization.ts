"use client";

import { authClient } from "@/lib/auth-client";

export function useOrganization() {
  const { data: activeOrg, isPending: loadingActive } = authClient.useActiveOrganization();
  const { data: orgs, isPending: loadingOrgs } = authClient.useListOrganizations();
  const { data: activeMember, isPending: loadingMember } = authClient.useActiveMember();

  const organization = activeOrg || null;
  const list = orgs || [];
  const membership = activeMember || null;
  const role = membership?.role || null;

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
  };
}
