import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  code: z.string().min(1, "Subject code is required").max(20),
  description: z.string().optional().or(z.literal("")),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
