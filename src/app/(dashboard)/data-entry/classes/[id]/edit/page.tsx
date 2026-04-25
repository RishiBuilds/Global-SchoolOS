"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, ArrowLeft, Loader2, Save } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/shared";
import { classSchema, type ClassFormData } from "@/lib/validations/class";
import { toast } from "sonner";
import Link from "next/link";

export default function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/classes/${id}`).then((r) => r.json()),
      fetch("/api/academic-years").then((r) => r.json()),
    ])
      .then(([cls, years]) => {
        setAcademicYears(years);
        reset({
          name: cls.name,
          section: cls.section || "",
          capacity: cls.capacity || "",
          academicYearId: cls.academicYearId,
        });
      })
      .catch(() => toast.error("Failed to load class data"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: ClassFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Class updated successfully!");
        router.push("/data-entry/classes");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update class");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="skeleton h-12 rounded-xl w-48" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slideUp">
      <div className="flex items-center gap-3">
        <Link href="/data-entry/classes">
          <button className="p-2 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <PageHeader title="Edit Class" icon={School} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-bg-card rounded-xl border border-border p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Class Name <span className="text-danger">*</span>
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            />
            {errors.name && (
              <p className="text-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Section
            </label>
            <input
              {...register("section")}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Capacity
            </label>
            <input
              type="number"
              {...register("capacity")}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Academic Year <span className="text-danger">*</span>
            </label>
            <select
              {...register("academicYearId")}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-input border border-border text-text-primary text-sm"
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
            {submitting ? "Saving..." : "Update Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
