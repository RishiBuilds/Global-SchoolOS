import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "Salary",
  "Utilities",
  "Maintenance",
  "Stationery",
  "Transport",
  "Events",
  "Infrastructure",
  "Technology",
  "Other",
] as const;

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().optional(),
  paidTo: z.string().optional(),
  paidBy: z.string().optional(),
  paymentMode: z.string().optional(),
  description: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
