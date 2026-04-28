"use client";

import { useState, useEffect, use } from "react";
import { ClipboardCheck, Save, Loader2, ArrowLeft, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/shared";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";

export default function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState("");
  const [results, setResults] = useState<Record<string, { marks: string; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);

  // New exam detail form
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newDetail, setNewDetail] = useState({ subjectId: "", examDate: "", maxMarks: "100", passingMarks: "33" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/examinations/${id}/results`).then(r => r.json()),
      fetch("/api/subjects").then(r => r.json()),
    ]).then(([e, s]) => {
      setExam(e);
      setSubjects(s);
      if (e.examDetails?.length > 0) {
        setSelectedDetail(e.examDetails[0].id);
        prefillResults(e.examDetails[0], e.class.students);
      }
    }).catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const prefillResults = (detail: any, students: any[]) => {
    const map: Record<string, { marks: string; remarks: string }> = {};
    students.forEach(s => {
      const existing = detail.results?.find((r: any) => r.student.id === s.id);
      map[s.id] = {
        marks: existing ? existing.marksObtained.toString() : "",
        remarks: existing?.remarks || "",
      };
    });
    setResults(map);
  };

  const handleDetailChange = (detailId: string) => {
    setSelectedDetail(detailId);
    const detail = exam.examDetails.find((d: any) => d.id === detailId);
    if (detail && exam.class?.students) {
      prefillResults(detail, exam.class.students);
    }
  };

  const handleSave = async () => {
    const entries = Object.entries(results)
      .filter(([, v]) => v.marks !== "")
      .map(([studentId, v]) => ({ studentId, marksObtained: v.marks, remarks: v.remarks }));

    if (entries.length === 0) { toast.error("No marks entered"); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/examinations/${id}/results`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDetailId: selectedDetail, results: entries }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Results saved for ${data.count} students`);
      } else toast.error("Failed to save results");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleAddSubject = async () => {
    if (!newDetail.subjectId || !newDetail.examDate) { toast.error("Fill required fields"); return; }
    // We need to create exam detail - reuse the exam creation endpoint with details
    try {
      const res = await fetch("/api/examinations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: exam.name, classId: exam.class?.id || exam.classId,
          startDate: exam.startDate, endDate: exam.endDate,
          description: exam.description,
          examDetails: [newDetail],
        }),
      });
      // Reload exam data
      const updated = await fetch(`/api/examinations/${id}/results`).then(r => r.json());
      setExam(updated);
      setShowAddSubject(false);
      setNewDetail({ subjectId: "", examDate: "", maxMarks: "100", passingMarks: "33" });
      toast.success("Subject added");
    } catch { toast.error("Failed to add subject"); }
  };

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  if (!exam) return <div className="text-center py-10 text-text-muted">Exam not found</div>;

  const currentDetail = exam.examDetails?.find((d: any) => d.id === selectedDetail);
  const students = exam.class?.students || [];

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/examinations">
            <button className="p-2.5 rounded-xl bg-white border border-border hover:bg-bg-muted text-text-muted hover:text-text-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm">
                <ClipboardCheck className="w-[18px] h-[18px] text-white" />
              </div>
              {exam.name}
            </h1>
            <p className="text-sm text-text-muted mt-0.5 ml-11">
              {exam.class?.name}{exam.class?.section ? ` — ${exam.class.section}` : ""} • {students.length} students
            </p>
          </div>
        </div>
        {currentDetail && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Results"}
          </Button>
        )}
      </div>

      {/* Subject tabs */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          {exam.examDetails?.map((d: any) => (
            <button key={d.id} onClick={() => handleDetailChange(d.id)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                selectedDetail === d.id ? "bg-primary text-white" : "bg-bg-muted text-text-violet-600 hover:bg-bg-card-hover"
              )}>
              {d.subject.name}
              <span className="ml-1 text-xs opacity-75">({d.maxMarks})</span>
            </button>
          ))}
          {exam.examDetails?.length === 0 && (
            <p className="text-sm text-text-muted">No subjects added yet</p>
          )}
        </div>
      </div>

      {/* Results table */}
      {currentDetail && students.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-bg-muted/50">
            <span className="text-sm font-semibold text-text-primary">{currentDetail.subject.name}</span>
            <span className="text-xs text-text-muted">Max: {currentDetail.maxMarks} | Pass: {currentDetail.passingMarks}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted w-32">Marks</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any, i: number) => {
                  const marks = parseFloat(results[s.id]?.marks || "0");
                  const passed = results[s.id]?.marks !== "" && marks >= currentDetail.passingMarks;
                  const failed = results[s.id]?.marks !== "" && marks < currentDetail.passingMarks;
                  return (
                    <tr key={s.id} className="border-b border-border/50 table-row-hover">
                      <td className="px-4 py-3 text-xs text-text-muted">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                            {getInitials(`${s.firstName} ${s.lastName}`)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{s.firstName} {s.lastName}</p>
                            <p className="text-[11px] text-text-muted font-mono">{s.admissionNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min="0" max={currentDetail.maxMarks}
                          value={results[s.id]?.marks || ""}
                          onChange={e => setResults(prev => ({ ...prev, [s.id]: { ...prev[s.id], marks: e.target.value } }))}
                          placeholder="—"
                          className="w-24 px-3 py-1.5 rounded-lg bg-bg-input border border-border text-text-primary text-sm text-center" />
                      </td>
                      <td className="px-4 py-3">
                        {results[s.id]?.marks !== "" && results[s.id]?.marks !== undefined ? (
                          <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium",
                            passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                          )}>{passed ? "PASS" : "FAIL"}</span>
                        ) : <span className="text-xs text-text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-text-muted">{students.length} students</p>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-violet-600">Select a subject to enter results</p>
        </div>
      )}
    </div>
  );
}
