"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  School,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import { PageHeader, Button, EmptyState } from "@/components/ui/shared";
import { toast } from "sonner";

interface ClassItem {
  id: string;
  name: string;
  section: string | null;
  capacity: number | null;
  academicYear: { name: string };
  _count: { students: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) return;
    
    setDeleteId(id);
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        toast.success("Class deleted successfully");
      } else {
        toast.error("Failed to delete class");
      }
    } catch {
      toast.error("Failed to delete class");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.section?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slideUp">
      <PageHeader
        title="Class Setup"
        description="Create and manage classes for your school"
        icon={School}
        action={
          <Link href="/data-entry/classes/new">
            <Button>
              <Plus className="w-4 h-4" />
              Add Class
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted text-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classes found"
          description="Get started by creating your first class"
          action={
            <Link href="/data-entry/classes/new">
              <Button>
                <Plus className="w-4 h-4" />
                Add Class
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <div
              key={cls.id}
              className="card-hover bg-white rounded-xl border border-border p-5 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <School className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {cls.name}
                      {cls.section && (
                        <span className="text-text-muted ml-1">
                          — Sec {cls.section}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {cls.academicYear.name}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/data-entry/classes/${cls.id}/edit`}>
                    <button className="p-1.5 rounded-lg hover:bg-bg-muted text-text-muted hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    disabled={deleteId === cls.id}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors disabled:opacity-50"
                  >
                    {deleteId === cls.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-text-violet-600">
                  <Users className="w-3.5 h-3.5" />
                  {cls._count.students} students
                </div>
                {cls.capacity && (
                  <div className="text-xs text-text-muted">
                    Capacity: {cls.capacity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
