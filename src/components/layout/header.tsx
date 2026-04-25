"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, Search, Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

const breadcrumbLabels: Record<string, string> = {
  "data-entry": "Data Entry",
  records: "Data Records",
  classes: "Class Setup",
  students: "Students",
  teachers: "Teachers",
  subjects: "Subjects",
  new: "Add New",
  edit: "Edit",
};

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part) => ({
    label: breadcrumbLabels[part] || part.charAt(0).toUpperCase() + part.slice(1),
  }));

  return (
    <header className="h-[57px] border-b border-border bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-bg-muted transition-colors text-text-muted"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <span className="text-text-muted">Home</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-text-muted" />
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? "text-text-primary font-medium"
                    : "text-text-muted"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-text-muted text-sm cursor-pointer hover:border-text-muted transition-colors">
          <Search className="w-4 h-4" />
          <span>Search…</span>
          <kbd className="ml-3 px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-muted border border-border text-text-muted">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-bg-muted transition-colors text-text-muted">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {session?.user?.name}
            </p>
            <p className="text-[11px] text-text-muted leading-tight">
              {(session?.user as any)?.schoolName}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
            {session?.user?.name ? getInitials(session.user.name) : "?"}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
