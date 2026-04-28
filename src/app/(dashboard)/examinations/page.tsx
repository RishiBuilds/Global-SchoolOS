"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Loader2, Calendar, BookOpen, Users } from "lucide-react";
import { PageHeader, Button, EmptyState } from "@/components/ui/shared";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ExaminationsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", classId: "", startDate: "", endDate: "", description: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/examinations").then(r => r.json()),
      fetch("/api/classes").then(r => r.json()),
      fetch("/api/subjects").then(r => r.json()),
    ]).then(([e, c, s]) => { setExams(e); setClasses(c); setSubjects(s); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.classId || !form.startDate || !form.endDate) {
      toast.error("Please fill required fields"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/examinations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setExams(prev => [created, ...prev]);
        setForm({ name: "", classId: "", startDate: "", endDate: "", description: "" });
        setShowForm(false);
        toast.success("Examination created");
      } else toast.error("Failed to create examination");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-slideUp">
      <PageHeader title="Examinations" description="Manage exams and enter student results" icon={ClipboardCheck}
        action={<Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" />{showForm ? "Cancel" : "Create Exam"}</Button>} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-5 animate-slideDown">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Exam Name <span className="text-danger">*</span></label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term 2025"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Class <span className="text-danger">*</span></label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm">
                <option value="">Select class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.section ? ` — ${c.section}` : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Start Date <span className="text-danger">*</span></label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">End Date <span className="text-danger">*</span></label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : exams.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No examinations yet" description="Create your first exam to start entering results"
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Create Exam</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-xl border border-border p-5 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                  <ClipboardCheck className="w-[18px] h-[18px] text-violet-600" />
                </div>
                <span className="text-xs text-text-muted">{exam.class.name}{exam.class.section ? ` — ${exam.class.section}` : ""}</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{exam.name}</h3>
              {exam.description && <p className="text-xs text-text-muted mb-3">{exam.description}</p>}
              <div className="flex items-center gap-3 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(exam.startDate)} — {formatDate(exam.endDate)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{exam.examDetails?.length || 0} subjects</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{exam.examDetails?.reduce((s: number, d: any) => s + (d._count?.results || 0), 0) || 0} results</span>
              </div>
              <Link href={`/examinations/${exam.id}/results`}>
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  View / Enter Results
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
