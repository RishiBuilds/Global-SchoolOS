"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCheck, ArrowLeft, Loader2, Save } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/shared";
import { teacherSchema, type TeacherFormData } from "@/lib/validations/teacher";
import { toast } from "sonner";
import Link from "next/link";

export default function NewTeacherPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TeacherFormData>({ resolver: zodResolver(teacherSchema) });

  const onSubmit = async (data: TeacherFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { toast.success("Teacher added!"); router.push("/data-entry/teachers"); }
      else { const err = await res.json(); toast.error(err.error || "Failed"); }
    } catch { toast.error("Error"); } finally { setSubmitting(false); }
  };

  const inp = "w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted text-sm";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slideUp">
      <div className="flex items-center gap-3">
        <Link href="/data-entry/teachers"><button className="p-2 rounded-lg hover:bg-bg-muted text-text-muted hover:text-text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></button></Link>
        <PageHeader title="Add New Teacher" description="Register a new teacher" icon={UserCheck} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Employee ID *</label><input {...register("employeeId")} placeholder="e.g. EMP001" className={inp} />{errors.employeeId && <p className="text-danger text-xs mt-1">{errors.employeeId.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">First Name *</label><input {...register("firstName")} placeholder="First name" className={inp} />{errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Last Name *</label><input {...register("lastName")} placeholder="Last name" className={inp} />{errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Email *</label><input type="email" {...register("email")} placeholder="teacher@email.com" className={inp} />{errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Phone *</label><input {...register("phone")} placeholder="+91 XXXXX XXXXX" className={inp} />{errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Date of Birth</label><input type="date" {...register("dateOfBirth")} className={inp} /></div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Gender *</label><select {...register("gender")} className={inp}><option value="">Select</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select>{errors.gender && <p className="text-danger text-xs mt-1">{errors.gender.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Qualification *</label><input {...register("qualification")} placeholder="e.g. M.Sc, B.Ed" className={inp} />{errors.qualification && <p className="text-danger text-xs mt-1">{errors.qualification.message}</p>}</div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Specialization</label><input {...register("specialization")} placeholder="e.g. Mathematics" className={inp} /></div>
          <div><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Salary (₹)</label><input type="number" {...register("salary")} placeholder="Monthly salary" className={inp} /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium text-text-violet-600 mb-1.5">Address</label><input {...register("address")} placeholder="Full address" className={inp} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/data-entry/teachers"><Button type="button" variant="secondary">Cancel</Button></Link>
          <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{submitting ? "Saving..." : "Save Teacher"}</Button>
        </div>
      </form>
    </div>
  );
}
