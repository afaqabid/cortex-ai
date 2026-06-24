import { prisma } from "@/lib/prisma";

export class AnalyticsService {
  static async getOverviewStats(organizationId: string) {
    // 1. Fetch all invoices
    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      select: {
        status: true,
        total: true,
        issueDate: true,
      },
    });

    const revenueByMonth: Record<string, { billed: number; paid: number }> = {};
    let totalInvoiced = 0;
    let totalPaid = 0;

    invoices.forEach((inv) => {
      const date = new Date(inv.issueDate);
      const month = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = { billed: 0, paid: 0 };
      }
      revenueByMonth[month].billed += inv.total;
      totalInvoiced += inv.total;

      if (inv.status === "PAID") {
        revenueByMonth[month].paid += inv.total;
        totalPaid += inv.total;
      }
    });

    // Convert to sorted array (chrono order)
    const revenueChartData = Object.entries(revenueByMonth)
      .map(([month, data]) => ({
        name: month,
        ...data,
      }))
      .reverse(); // assuming newest shows up last

    // 2. Invoice Breakdown by Status
    const invoiceStatusCount: Record<string, number> = {};
    invoices.forEach((inv) => {
      invoiceStatusCount[inv.status] = (invoiceStatusCount[inv.status] || 0) + 1;
    });
    const invoiceStatusData = Object.entries(invoiceStatusCount).map(
      ([status, count]) => ({
        name: status,
        value: count,
      })
    );

    // 3. Project Workload
    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: { status: true },
    });
    const projectStatusCount: Record<string, number> = {};
    projects.forEach((proj) => {
      projectStatusCount[proj.status] = (projectStatusCount[proj.status] || 0) + 1;
    });
    const projectWorkloadData = Object.entries(projectStatusCount).map(
      ([status, count]) => ({
        name: status.replace("_", " "),
        value: count,
      })
    );

    // 4. CRM Leads conversion / pipeline
    const leads = await prisma.lead.findMany({
      where: { organizationId },
      select: { status: true, value: true },
    });

    let totalLeadValue = 0;
    const leadsByStatusCount: Record<string, number> = {};
    leads.forEach((l) => {
      leadsByStatusCount[l.status] = (leadsByStatusCount[l.status] || 0) + 1;
      if (l.value) totalLeadValue += l.value;
    });

    const leadFunnelData = Object.entries(leadsByStatusCount).map(
      ([status, count]) => ({
        name: status,
        count,
      })
    );

    return {
      totalInvoiced,
      totalPaid,
      totalLeadValue,
      revenueChartData,
      invoiceStatusData,
      projectWorkloadData,
      leadFunnelData,
      totalProjects: projects.length,
      totalLeads: leads.length,
    };
  }
}
