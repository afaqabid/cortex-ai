"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Grid3X3,
  List,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useContacts } from "@/hooks/queries/use-contacts";
import { toast } from "sonner";

export default function ContactsPage() {
  const { contacts, isLoadingContacts, createContact } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    company: "",
    address: "",
    notes: "",
  });

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      title: "",
      company: "",
      address: "",
      notes: "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact(formData);
      toast.success("Contact created successfully");
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to create contact");
    }
  };

  const filtered = contacts.filter(
    (c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">Your contact directory</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          />
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2 transition-colors cursor-pointer", viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("p-2 transition-colors cursor-pointer", viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoadingContacts ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Loading contacts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
          <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No contacts found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Add contacts to build your corporate address book.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contact: any, i: number) => {
            const avatar = contact.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 font-bold text-sm">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.title || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{contact.company || "—"}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Company</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Phone</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact: any) => {
                  const avatar = contact.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
                  return (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold">{avatar}</div>
                          <div>
                            <p className="text-sm font-medium">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.title || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell">{contact.company || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{contact.email || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{contact.phone || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side Sheet Form */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border p-6 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Add Contact</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="Jane Doe" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="jane@company.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="+1 (555) 123-4567" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Company</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Job Title</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="CTO" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="123 Main St, New York" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="Key details..." />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-lg border border-input bg-background py-2 text-sm font-semibold hover:bg-accent transition-all cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 rounded-lg bg-brand-500 text-white py-2 text-sm font-semibold shadow-lg hover:bg-brand-600 transition-all cursor-pointer">Save Contact</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
