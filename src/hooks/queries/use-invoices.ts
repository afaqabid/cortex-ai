"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateInvoiceInput } from "@/lib/validators/invoices";

export function useInvoices() {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/v1/invoices");
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceInput) => {
      const res = await fetch("/api/v1/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoadingInvoices: invoicesQuery.isLoading,
    invoicesError: invoicesQuery.error,
    createInvoice: createInvoiceMutation.mutateAsync,
    isCreatingInvoice: createInvoiceMutation.isPending,
  };
}

export function useInvoiceDetails(id: string) {
  const queryClient = useQueryClient();

  const invoiceQuery = useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/invoices/${id}`);
      if (!res.ok) throw new Error("Failed to fetch invoice details");
      return res.json();
    },
    enabled: !!id,
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async (data: { status: string; paidAmount?: number }) => {
      const res = await fetch(`/api/v1/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update invoice status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/invoices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete invoice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/invoices/${id}/send`, {
        method: "POST",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to send invoice email");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
    },
  });

  return {
    invoice: invoiceQuery.data,
    isLoadingInvoice: invoiceQuery.isLoading,
    invoiceError: invoiceQuery.error,
    updateInvoiceStatus: updateInvoiceStatusMutation.mutateAsync,
    isUpdatingStatus: updateInvoiceStatusMutation.isPending,
    deleteInvoice: deleteInvoiceMutation.mutateAsync,
    isDeletingInvoice: deleteInvoiceMutation.isPending,
    sendInvoice: sendInvoiceMutation.mutateAsync,
    isSendingInvoice: sendInvoiceMutation.isPending,
  };
}
