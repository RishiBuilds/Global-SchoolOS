import { z } from "zod";

export const examinationSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  classId: z.string().min(1, "Please select a class"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
});

export const examDetailSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject"),
  examDate: z.string().min(1, "Exam date is required"),
  maxMarks: z.coerce.number().positive("Max marks must be positive"),
  passingMarks: z.coerce.number().nonnegative("Passing marks required"),
});

export const examResultEntrySchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.coerce.number().nonnegative(),
  remarks: z.string().optional(),
});

export const bulkResultsSchema = z.object({
  examDetailId: z.string().min(1),
  results: z.array(examResultEntrySchema).min(1),
});

export type ExaminationFormData = z.infer<typeof examinationSchema>;
export type ExamDetailFormData = z.infer<typeof examDetailSchema>;
export type BulkResultsData = z.infer<typeof bulkResultsSchema>;
