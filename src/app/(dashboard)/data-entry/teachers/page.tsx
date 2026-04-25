"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserCheck, Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { PageHeader, Button, EmptyState } from "@/components/ui/shared";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teachers").then(r => r.json()).then(setTeachers).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (res.ok) { setTeachers(p => p.filter(t => t.id !== id)); toast.success("Deleted"); }
      else toast.error("Failed");
    } catch { toast.error("Failed"); } finally { setDeleteId(null); }
  };

  const filtered = teachers.filter(t => !search || `${t.firstName} ${t.lastName} ${t.employeeId}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-slideUp">
      <PageHeader title="Teacher Setup" description="Manage teaching staff" icon={UserCheck}
        action={<Link href="/data-entry/teachers/new"><Button><Plus className="w-4 h-4" />Add Teacher</Button></Link>} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type="text" placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted text-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No teachers found" description="Add your first teacher"
          action={<Link href="/data-entry/teachers/new"><Button><Plus className="w-4 h-4" />Add Teacher</Button></Link>} />
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Teacher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Qualification</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Phone</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-border/50 table-row-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">{getInitials(`${t.firstName} ${t.lastName}`)}</div>
                        <span className="text-sm font-medium text-text-primary">{t.firstName} {t.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm font-mono text-text-violet-600">{t.employeeId}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-text-violet-600">{t.email}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-text-violet-600">{t.qualification}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-text-violet-600">{t.phone}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/data-entry/teachers/${t.id}/edit`}><button className="p-1.5 rounded-lg hover:bg-bg-muted text-text-muted hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button></Link>
                        <button onClick={() => handleDelete(t.id)} disabled={deleteId === t.id} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors disabled:opacity-50">
                          {deleteId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border"><p className="text-xs text-text-muted">Showing {filtered.length} teachers</p></div>
        </div>
      )}
    </div>
  );
}
