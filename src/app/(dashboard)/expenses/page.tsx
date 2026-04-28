"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Loader2, Search, Calendar } from "lucide-react";
import { PageHeader, Button, EmptyState } from "@/components/ui/shared";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "", category: "", amount: "", date: new Date().toISOString().split("T")[0],
    paidTo: "", paidBy: "", paymentMode: "Cash", description: "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    fetch(`/api/expenses?${params}`)
      .then(r => r.json())
      .then(setExpenses)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.amount) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setExpenses(prev => [created, ...prev]);
        setForm({ title: "", category: "", amount: "", date: new Date().toISOString().split("T")[0], paidTo: "", paidBy: "", paymentMode: "Cash", description: "" });
        setShowForm(false);
        toast.success("Expense recorded");
      } else toast.error("Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const filtered = expenses.filter(e => {
    if (!search) return true;
    return e.title.toLowerCase().includes(search.toLowerCase());
  });

  const totalThisMonth = filtered.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  filtered.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });

  const categoryColors: Record<string, string> = {
    Salary: "bg-blue-50 text-blue-600",
    Utilities: "bg-amber-50 text-amber-600",
    Maintenance: "bg-orange-50 text-orange-600",
    Stationery: "bg-violet-50 text-violet-600",
    Transport: "bg-emerald-50 text-emerald-600",
    Events: "bg-pink-50 text-pink-600",
    Infrastructure: "bg-indigo-50 text-indigo-600",
    Technology: "bg-cyan-50 text-cyan-600",
    Other: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="space-y-6 animate-slideUp">
      <PageHeader title="Expenses" description="Track and manage school expenditure" icon={Wallet}
        action={<Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" />{showForm ? "Cancel" : "Add Expense"}</Button>} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-5 animate-slideDown">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Title <span className="text-danger">*</span></label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Electricity Bill"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Category <span className="text-danger">*</span></label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm">
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Amount (₹) <span className="text-danger">*</span></label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Paid To</label>
              <input value={form.paidTo} onChange={e => setForm({ ...form, paidTo: e.target.value })} placeholder="Vendor name"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Payment Mode</label>
              <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm">
                {["Cash", "UPI", "Bank Transfer", "Cheque", "Card"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Saving..." : "Add Expense"}
            </Button>
          </div>
        </form>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-red-500 p-4">
          <p className="text-xs text-text-muted">Total Expenses</p>
          <p className="text-xl font-bold text-red-500 mt-0.5">₹{totalThisMonth.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-primary p-4">
          <p className="text-xs text-text-muted">Transactions</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-amber-500 p-4 sm:col-span-2">
          <p className="text-xs text-text-muted mb-2">By Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryTotals).slice(0, 5).map(([cat, amt]) => (
              <span key={cat} className={cn("px-2 py-0.5 rounded-md text-xs font-medium", categoryColors[cat] || "bg-gray-50 text-gray-600")}>
                {cat}: ₹{amt.toLocaleString("en-IN")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted text-sm" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-white border border-border text-text-primary text-sm">
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="No expenses recorded" description="Start tracking expenses"
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Add Expense</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Title", "Category", "Amount", "Paid To", "Mode", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp.id} className="border-b border-border/50 table-row-hover">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{exp.title}</p>
                      {exp.description && <p className="text-[11px] text-text-muted">{exp.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", categoryColors[exp.category] || "bg-gray-50 text-gray-600")}>{exp.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-500">₹{exp.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-text-violet-600">{exp.paidTo || "—"}</td>
                    <td className="px-4 py-3 text-sm text-text-violet-600">{exp.paymentMode || "—"}</td>
                    <td className="px-4 py-3 text-sm text-text-violet-600">{formatDate(exp.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border"><p className="text-xs text-text-muted">Showing {filtered.length} expenses</p></div>
        </div>
      )}
    </div>
  );
}
