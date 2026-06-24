"use client";

import { useOrganization } from "./use-organization";

export type PermissionAction =
  | "org:write"       // Edit organization settings, delete org
  | "org:billing"     // Manage subscription, billing details
  | "members:manage"  // Invite, kick, change member roles
  | "leads:read"      // View leads/CRM
  | "leads:write"     // Create/edit leads
  | "leads:delete"    // Delete leads
  | "projects:read"   // View projects
  | "projects:write"  // Create/edit projects
  | "projects:delete" // Delete projects
  | "tasks:write"     // Create/edit/delete tasks
  | "invoices:read"   // View invoices
  | "invoices:write"  // Create/edit invoices
  | "invoices:delete" // Delete/cancel invoices
  | "docs:read"       // View documents
  | "docs:write";     // Create/edit documents

export function usePermissions() {
  const { role, loading } = useOrganization();

  const checkPermission = (action: PermissionAction): boolean => {
    if (loading || !role) return false;

    // Convert role to uppercase to match schema enum just in case
    const normalizedRole = role.toUpperCase();

    // Owner has absolute permissions
    if (normalizedRole === "OWNER") {
      return true;
    }

    switch (action) {
      case "org:write":
        return normalizedRole === "ADMIN";
      case "org:billing":
        // Only OWNER has billing access
        return false;
      case "members:manage":
        return normalizedRole === "ADMIN";
      case "leads:read":
      case "leads:write":
        return ["ADMIN", "MANAGER", "EMPLOYEE"].includes(normalizedRole);
      case "leads:delete":
        return ["ADMIN", "MANAGER"].includes(normalizedRole);
      case "projects:read":
      case "projects:write":
        return ["ADMIN", "MANAGER", "EMPLOYEE"].includes(normalizedRole);
      case "projects:delete":
        return ["ADMIN", "MANAGER"].includes(normalizedRole);
      case "tasks:write":
        return ["ADMIN", "MANAGER", "EMPLOYEE"].includes(normalizedRole);
      case "invoices:read":
        return ["ADMIN", "MANAGER", "CLIENT"].includes(normalizedRole);
      case "invoices:write":
        return ["ADMIN", "MANAGER"].includes(normalizedRole);
      case "invoices:delete":
        return ["ADMIN"].includes(normalizedRole);
      case "docs:read":
        return true; // Everyone, including Client, can read documents (filtering public/private is handled at data level)
      case "docs:write":
        return ["ADMIN", "MANAGER", "EMPLOYEE"].includes(normalizedRole);
      default:
        return false;
    }
  };

  return {
    checkPermission,
    role,
    loading,
    isAdmin: role === "admin" || role === "owner" || role === "ADMIN" || role === "OWNER",
    isClient: role === "client" || role === "CLIENT",
  };
}
