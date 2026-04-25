import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(50),
  section: z.string().max(10).optional().or(z.literal("")),
  capacity: z.coerce.number().int().positive().optional().or(z.literal("")),
  academicYearId: z.string().min(1, "Academic year is required"),
});

export const academicYearSchema = z.object({
  name: z.string().min(1, "Academic year name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isCurrent: z.boolean().default(false),
});

export type ClassFormData = z.infer<typeof classSchema>;
export type AcademicYearFormData = z.infer<typeof academicYearSchema>;
