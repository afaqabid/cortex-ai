"use client";

import { use, useState } from "react";
import { useInvoiceDetails } from "@/hooks/queries/use-invoices";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Trash2,
  CheckCircle2,
  Send,
  Loader2,
  Calendar,
  Building,
  CreditCard,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/constants";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    invoice,
    isLoadingInvoice,
    updateInvoiceStatus,
    isUpdatingStatus,
    deleteInvoice,
    isDeletingInvoice,
    sendInvoice,
    isSendingInvoice,
  } = useInvoiceDetails(id);

  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isMarkingSent, setIsMarkingSent] = useState(false);

  if (isLoadingInvoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-muted-foreground font-medium">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 bg-card border rounded-xl">
        <h3 className="text-lg font-semibold text-destructive">Invoice Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1">This invoice does not exist or you do not have permission to view it.</p>
        <Link href="/invoices" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-500 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = async (status: string) => {
    if (status === "PAID") setIsMarkingPaid(true);
    if (status === "SENT") setIsMarkingSent(true);

    try {
      await updateInvoiceStatus({ status });
      toast.success(`Invoice marked as ${INVOICE_STATUS_LABELS[status]}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsMarkingPaid(false);
      setIsMarkingSent(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      const res = await sendInvoice();
      if (res.mocked) {
        toast.success("Demo: Email content logged to backend console successfully!");
      } else {
        toast.success("Invoice email sent successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invoice email");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteInvoice();
      toast.success("Invoice deleted successfully");
      router.push("/invoices");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Wrapper & CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="p-2 border border-border bg-card rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Invoice Details</h1>
            <p className="text-xs text-muted-foreground">Manage and export invoice statements.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </button>

          {invoice.client?.email && (
            <button
              onClick={handleSendEmail}
              disabled={isSendingInvoice}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              {isSendingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Email
            </button>
          )}

          {invoice.status === "DRAFT" && (
            <button
              onClick={() => handleUpdateStatus("SENT")}
              disabled={isMarkingSent}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              {isMarkingSent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Mark Sent
            </button>
          )}

          {invoice.status !== "PAID" && (
            <button
              onClick={() => handleUpdateStatus("PAID")}
              disabled={isMarkingPaid}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isMarkingPaid ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark Paid
            </button>
          )}

          {(invoice.status === "DRAFT" || invoice.status === "CANCELLED") && (
            <button
              onClick={handleDelete}
              disabled={isDeletingInvoice}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3.5 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isDeletingInvoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Billing Card Template */}
      <div
        id="printable-invoice"
        className="border border-border bg-card p-8 rounded-2xl shadow-sm space-y-8 max-w-4xl mx-auto"
      >
        {/* Top Info Banner */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-brand-500">CORTEX AI</h2>
            <p className="text-xs text-muted-foreground font-medium">Enterprise Business Operating System</p>
          </div>
          <div className="text-right">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 inline-flex"
              style={{
                backgroundColor: `${INVOICE_STATUS_COLORS[invoice.status]}15`,
                color: INVOICE_STATUS_COLORS[invoice.status],
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INVOICE_STATUS_COLORS[invoice.status] }} />
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
            <p className="text-xs font-extrabold mt-3 text-foreground">{invoice.number}</p>
          </div>
        </div>

        {/* Addresses & Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b py-6 border-border/60">
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Billed To</span>
            {invoice.client ? (
              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-foreground">{invoice.client.company || "No Company"}</p>
                <p className="font-semibold text-muted-foreground">{invoice.client.name}</p>
                {invoice.client.email && (
                  <p className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
                    <Mail className="h-3.5 w-3.5" /> {invoice.client.email}
                  </p>
                )}
                {invoice.client.phone && (
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {invoice.client.phone}
                  </p>
                )}
                {invoice.client.address && (
                  <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{invoice.client.address}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No client details linked.</p>
            )}
          </div>

          <div className="space-y-4 md:text-right flex flex-col md:items-end justify-between">
            <div className="space-y-2 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date Issued</span>
                <span className="font-semibold">{new Date(invoice.issueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date Due</span>
                <span className="font-semibold text-red-500">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            {invoice.paidAt && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Paid on {new Date(invoice.paidAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Items table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Rate</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground font-medium">
              {invoice.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3 px-2 text-foreground font-semibold">{item.description}</td>
                  <td className="py-3 px-2 text-center">{item.quantity}</td>
                  <td className="py-3 px-2 text-right">${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-2 text-right">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary pricing calculations */}
        <div className="flex justify-end pt-4">
          <div className="w-full max-w-[280px] space-y-2 text-xs border-t pt-4 border-border/60">
            <div className="flex justify-between text-muted-foreground font-semibold">
              <span>Subtotal</span>
              <span>${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Tax ({invoice.tax}%)</span>
                <span>
                  $
                  {((invoice.subtotal * invoice.tax) / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-red-500 font-semibold">
                <span>Discount</span>
                <span>-${invoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-foreground pt-2.5 border-t border-border">
              <span>Total Due</span>
              <span className="text-brand-500">
                ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/60 text-xs">
            {invoice.notes && (
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notes</span>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Terms</span>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
