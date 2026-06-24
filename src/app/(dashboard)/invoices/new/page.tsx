"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/hooks/queries/use-invoices";
import { useClients } from "@/hooks/queries/use-clients";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Loader2, Save, Sparkles, Building2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NewInvoicePage() {
  const router = useRouter();
  const { createInvoice, isCreatingInvoice } = useInvoices();
  const { clients, createClient } = useClients();

  // New client modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", email: "", company: "" });
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Invoice form state
  const [formData, setFormData] = useState({
    clientId: "",
    dueDate: "",
    currency: "USD",
    notes: "",
    terms: "",
    tax: 0,
    discount: 0,
    items: [{ description: "", quantity: 1, rate: 0 }],
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, idx) => idx !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = formData.items.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: value };
    });
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;

    setIsCreatingClient(true);
    try {
      const client = await createClient(clientForm);
      toast.success("Client added successfully");
      setFormData({ ...formData, clientId: client.id });
      setIsClientModalOpen(false);
      setClientForm({ name: "", email: "", company: "" });
    } catch {
      toast.error("Failed to add client");
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.error("Please select or create a client first.");
      return;
    }
    if (formData.items.some((i) => !i.description.trim() || i.rate < 0 || i.quantity <= 0)) {
      toast.error("Please fill all item fields with valid values.");
      return;
    }

    try {
      await createInvoice(formData);
      toast.success("Invoice created successfully");
      router.push("/invoices");
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  // Live calculations
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * formData.tax) / 100;
  const total = subtotal + taxAmount - formData.discount;

  const activeClient = clients.find((c: any) => c.id === formData.clientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/invoices"
          className="p-2 border border-border bg-card rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-xs text-muted-foreground">Draft a new invoice billing statement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="border border-border bg-card p-5 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-brand-500" /> Billing Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Client</label>
                <div className="flex gap-2">
                  <select
                    value={formData.clientId}
                    required
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.company ? `${c.company} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(true)}
                    className="h-9 px-3 rounded-lg border border-input bg-muted/50 hover:bg-accent text-xs font-semibold cursor-pointer"
                  >
                    Add Client
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Discount value</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-border bg-card p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="text-sm font-bold">Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-brand-500 font-semibold hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-[4] min-w-0">
                    <label className="block text-[10px] font-semibold mb-1 text-muted-foreground">Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Website development"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold mb-1 text-muted-foreground">Qty</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-center focus-visible:outline-none"
                    />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-[10px] font-semibold mb-1 text-muted-foreground">Rate</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", Number(e.target.value))}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={formData.items.length === 1}
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 border border-border rounded-lg bg-muted/40 text-red-500 hover:bg-red-500/10 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="border border-border bg-card p-5 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold border-b border-border pb-2">Notes & Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Customer Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Thank you for your business..."
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Terms & Conditions</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  placeholder="Payment is due within 30 days..."
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Link
              href="/invoices"
              className="px-4 py-2 border border-border bg-card rounded-lg text-sm font-semibold hover:bg-accent cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isCreatingInvoice}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isCreatingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Invoice
            </button>
          </div>
        </form>

        {/* Side-by-side Template Preview */}
        <div className="lg:col-span-5 border border-border bg-card/60 p-5 rounded-2xl shadow-sm space-y-4 sticky top-6">
          <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-brand-500 animate-pulse" /> Live Preview
          </h3>

          <div className="bg-white border rounded-xl p-6 text-black space-y-6 shadow-sm min-h-[460px] flex flex-col justify-between select-none">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-brand-600">INVOICE</h2>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">INV-XXXX-XXXX</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{activeClient?.company || "Company Name"}</p>
                  <p className="text-[9px] text-gray-500">{activeClient?.name || "Client Name"}</p>
                </div>
              </div>

              {/* Grid dates */}
              <div className="grid grid-cols-2 gap-4 border-y py-3 border-gray-100 text-[10px]">
                <div>
                  <span className="block text-gray-400 font-bold uppercase">Date Issued</span>
                  <span className="font-bold text-gray-700">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-bold uppercase">Date Due</span>
                  <span className="font-bold text-gray-700">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : "Not set"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium truncate max-w-[120px]">
                        {item.description || "Website redesign"}
                      </td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">${item.rate.toFixed(2)}</td>
                      <td className="py-2 text-right">${(item.quantity * item.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations block */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {formData.tax > 0 && (
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Tax ({formData.tax}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              {formData.discount > 0 && (
                <div className="flex justify-between text-[10px] text-red-500">
                  <span>Discount</span>
                  <span>-${formData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black text-gray-900 pt-2 border-t">
                <span>Total Due ({formData.currency})</span>
                <span className="text-brand-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Dialog Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold">New Client</h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Company Name</label>
                <input
                  type="text"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
                  placeholder="john@acme.com"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="flex-1 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient || !clientForm.name.trim()}
                  className="flex-1 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                >
                  {isCreatingClient && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
