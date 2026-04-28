import { z } from "zod";

export const feeStructureSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  classId: z.string().min(1, "Please select a class"),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

export const feePaymentSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  feeStructureId: z.string().min(1, "Please select a fee"),
  amountPaid: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.string().optional(),
  remarks: z.string().optional(),
});

export type FeeStructureFormData = z.infer<typeof feeStructureSchema>;
export type FeePaymentFormData = z.infer<typeof feePaymentSchema>;
