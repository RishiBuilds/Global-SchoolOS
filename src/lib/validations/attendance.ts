import { z } from "zod";

export const attendanceEntrySchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"]),
  remarks: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  classId: z.string().min(1, "Please select a class"),
  date: z.string().min(1, "Please select a date"),
  entries: z.array(attendanceEntrySchema).min(1, "No students to mark"),
});

export type AttendanceEntry = z.infer<typeof attendanceEntrySchema>;
export type BulkAttendanceData = z.infer<typeof bulkAttendanceSchema>;
