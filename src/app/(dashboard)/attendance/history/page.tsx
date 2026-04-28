"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/shared";
import { toast } from "sonner";
import { cn, getInitials, formatDate } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PRESENT: "bg-emerald-50 text-emerald-600",
  ABSENT: "bg-red-50 text-red-500",
  LATE: "bg-amber-50 text-amber-600",
  HALF_DAY: "bg-orange-50 text-orange-500",
  ON_LEAVE: "bg-violet-50 text-violet-500",
};

export default function AttendanceHistoryPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  useEffect(() => {
    if (selectedClass && fromDate && toDate) {
      setLoading(true);
      fetch(
        `/api/attendance/students?classId=${selectedClass}&from=${fromDate}&to=${toDate}`
      )
        .then((r) => r.json())
        .then(setRecords)
        .catch(() => toast.error("Failed to load attendance"))
        .finally(() => setLoading(false));
    }
  }, [selectedClass, fromDate, toDate]);

  // Group by date
  const grouped: Record<string, any[]> = {};
  records.forEach((r) => {
    const dateKey = new Date(r.date).toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(r);
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Overall stats
  const totalRecords = records.length;
  const presentCount = records.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE"
  ).length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const attendancePct =
    totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  return (
    <div className="space-y-6 animate-slideUp">
      <PageHeader
        title="Attendance History"
        description="View past attendance records by class and date range"
        icon={CalendarCheck}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            >
              <option value="">Select class</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.section ? ` — Sec ${c.section}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {selectedClass && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-primary p-4">
            <p className="text-xs text-text-muted">Total Records</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              {totalRecords}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-emerald-500 p-4">
            <p className="text-xs text-text-muted">Present/Late</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {presentCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-red-500 p-4">
            <p className="text-xs text-text-muted">Absent</p>
            <p className="text-xl font-bold text-red-500 mt-0.5">
              {absentCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border border-l-[3px] border-l-violet-500 p-4">
            <p className="text-xs text-text-muted">Attendance Rate</p>
            <p className="text-xl font-bold text-violet-600 mt-0.5">
              {attendancePct}%
            </p>
          </div>
        </div>
      )}

      {/* Records by date */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : sortedDates.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const dayRecords = grouped[dateKey];
            const dayPresent = dayRecords.filter(
              (r) => r.status === "PRESENT" || r.status === "LATE"
            ).length;

            return (
              <div
                key={dateKey}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-text-primary">
                      {formatDate(dateKey)}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {dayPresent}/{dayRecords.length} present
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {dayRecords.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-4 py-2.5 table-row-hover"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                          {getInitials(
                            `${r.student.firstName} ${r.student.lastName}`
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {r.student.firstName} {r.student.lastName}
                          </p>
                          <p className="text-[11px] text-text-muted font-mono">
                            {r.student.admissionNo}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-xs font-medium",
                          statusStyles[r.status] || "bg-bg-muted text-text-muted"
                        )}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : selectedClass ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <CalendarCheck className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-violet-600">
            No attendance records found
          </p>
          <p className="text-xs text-text-muted mt-1">
            Try a different date range or mark attendance first
          </p>
        </div>
      ) : null}
    </div>
  );
}
