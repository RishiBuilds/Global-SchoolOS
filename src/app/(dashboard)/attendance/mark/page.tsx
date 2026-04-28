"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Save,
  CheckCheck,
} from "lucide-react";
import { PageHeader, Button } from "@/components/ui/shared";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "ABSENT", label: "Absent", icon: XCircle, color: "text-red-500 bg-red-50 border-red-200" },
  { value: "LATE", label: "Late", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "HALF_DAY", label: "Half Day", icon: Clock, color: "text-orange-500 bg-orange-50 border-orange-200" },
  { value: "ON_LEAVE", label: "On Leave", icon: XCircle, color: "text-violet-500 bg-violet-50 border-violet-200" },
];

interface AttendanceEntry {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  status: string;
  remarks: string;
}

export default function MarkAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoadingStudents(true);

    try {
      // Load students for this class
      const studentsRes = await fetch(`/api/students?classId=${selectedClass}`);
      const students = await studentsRes.json();

      // Check if attendance already exists
      const attendanceRes = await fetch(
        `/api/attendance/students?classId=${selectedClass}&date=${selectedDate}`
      );
      const existing = await attendanceRes.json();

      const existingMap: Record<string, any> = {};
      existing.forEach((a: any) => {
        existingMap[a.studentId] = a;
      });

      setEntries(
        students.map((s: any) => ({
          studentId: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          admissionNo: s.admissionNo,
          status: existingMap[s.id]?.status || "PRESENT",
          remarks: existingMap[s.id]?.remarks || "",
        }))
      );
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudents();
    }
  }, [selectedClass, selectedDate]);

  const setStatus = (index: number, status: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status } : e))
    );
  };

  const markAllPresent = () => {
    setEntries((prev) => prev.map((e) => ({ ...e, status: "PRESENT" })));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedDate || entries.length === 0) {
      toast.error("Please select a class and date first");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/attendance/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          entries: entries.map((e) => ({
            studentId: e.studentId,
            status: e.status,
            remarks: e.remarks,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Attendance saved for ${data.count} students`);
      } else {
        toast.error("Failed to save attendance");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const summary = {
    present: entries.filter((e) => e.status === "PRESENT").length,
    absent: entries.filter((e) => e.status === "ABSENT").length,
    late: entries.filter((e) => e.status === "LATE").length,
    halfDay: entries.filter((e) => e.status === "HALF_DAY").length,
    leave: entries.filter((e) => e.status === "ON_LEAVE").length,
  };

  return (
    <div className="space-y-6 animate-slideUp">
      <PageHeader
        title="Mark Attendance"
        description="Record daily attendance for a class"
        icon={CalendarCheck}
        action={
          entries.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={markAllPresent}>
                <CheckCheck className="w-4 h-4" />
                Mark All Present
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Selectors */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Select Class <span className="text-danger">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            >
              <option value="">Choose a class</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.section ? ` — Sec ${c.section}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Present", count: summary.present, color: "border-l-emerald-500 text-emerald-600" },
            { label: "Absent", count: summary.absent, color: "border-l-red-500 text-red-500" },
            { label: "Late", count: summary.late, color: "border-l-amber-500 text-amber-600" },
            { label: "Half Day", count: summary.halfDay, color: "border-l-orange-500 text-orange-500" },
            { label: "On Leave", count: summary.leave, color: "border-l-violet-500 text-violet-500" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "bg-white rounded-xl border border-border border-l-[3px] p-4",
                s.color
              )}
            >
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-xl font-bold mt-0.5">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Student List */}
      {loadingStudents ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted w-8">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.studentId}
                    className="border-b border-border/50 table-row-hover transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-text-muted">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {getInitials(`${entry.firstName} ${entry.lastName}`)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {entry.firstName} {entry.lastName}
                          </p>
                          <p className="text-xs text-text-muted font-mono">
                            {entry.admissionNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(i, opt.value)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150",
                              entry.status === opt.value
                                ? opt.color
                                : "bg-white border-border text-text-muted hover:border-text-muted"
                            )}
                          >
                            <opt.icon className="w-3 h-3" />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {entries.length} students in class
            </p>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-violet-600">No students found in this class</p>
          <p className="text-xs text-text-muted mt-1">Add students to this class first</p>
        </div>
      ) : null}
    </div>
  );
}
