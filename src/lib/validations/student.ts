import { z } from "zod";

export const studentSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  parentName: z.string().min(1, "Parent/guardian name is required"),
  parentPhone: z.string().min(1, "Parent phone is required"),
  parentEmail: z.string().email().optional().or(z.literal("")),
  classId: z.string().min(1, "Class is required"),
});

export type StudentFormData = z.infer<typeof studentSchema>;
