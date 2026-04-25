import { z } from "zod";

export const teacherSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  qualification: z.string().min(1, "Qualification is required"),
  specialization: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  salary: z.coerce.number().positive().optional().or(z.literal("")),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
