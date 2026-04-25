"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, ArrowLeft, Loader2, Save } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/shared";
import { classSchema, type ClassFormData } from "@/lib/validations/class";
import { toast } from "sonner";
import Link from "next/link";

export default function NewClassPage() {
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  useEffect(() => {
    fetch("/api/academic-years")
      .then((res) => res.json())
      .then(setAcademicYears)
      .catch(() => toast.error("Failed to load academic years"));
  }, []);

  const onSubmit = async (data: ClassFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Class created successfully!");
        router.push("/data-entry/classes");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create class");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slideUp">
      <div className="flex items-center gap-3">
        <Link href="/data-entry/classes">
          <button className="p-2 rounded-lg hover:bg-bg-muted text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <PageHeader
          title="Add New Class"
          description="Create a new class for your school"
          icon={School}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-border p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-violet-600 mb-1.5">
              Class Name <span className="text-danger">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Class 10"
              className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted text-sm"
            />
            {errors.name && (
              <p className="text-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-violet-600 mb-1.5">
              Section
            </label>
            <input
              {...register("section")}
              placeholder="e.g. A, B, C"
              className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-violet-600 mb-1.5">
              Capacity
            </label>
            <input
              type="number"
              {...register("capacity")}
              placeholder="e.g. 40"
              className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-violet-600 mb-1.5">
              Academic Year <span className="text-danger">*</span>
            </label>
            <select
              {...register("academicYearId")}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary text-sm"
            >
              <option value="">Select academic year</option>
              {academicYears.map((ay: any) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} {ay.isCurrent ? "(Current)" : ""}
                </option>
              ))}
            </select>
            {errors.academicYearId && (
              <p className="text-danger text-xs mt-1">
                {errors.academicYearId.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/data-entry/classes">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {submitting ? "Saving..." : "Save Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
