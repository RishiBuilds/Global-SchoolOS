"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  School,
  Users,
  UserCheck,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  ClipboardList,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: { label: string; href: string; icon: React.ReactNode }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Data Entry",
    icon: <ClipboardList className="w-4 h-4" />,
    items: [
      { label: "Class Setup", href: "/data-entry/classes", icon: <School className="w-4 h-4" /> },
      { label: "Student Setup", href: "/data-entry/students", icon: <Users className="w-4 h-4" /> },
      { label: "Teacher Setup", href: "/data-entry/teachers", icon: <UserCheck className="w-4 h-4" /> },
      { label: "Subject Setup", href: "/data-entry/subjects", icon: <BookOpen className="w-4 h-4" /> },
    ],
  },
  {
    label: "Data Records",
    icon: <FileText className="w-4 h-4" />,
    items: [
      { label: "Student Details", href: "/records/students", icon: <Users className="w-4 h-4" /> },
      { label: "Teacher Records", href: "/records/teachers", icon: <UserCheck className="w-4 h-4" /> },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Data Entry", "Data Records"]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-border z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-[64px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[57px] border-b border-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-text-primary tracking-tight animate-fadeIn">
            SchoolOS<span className="text-primary"> Global</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Dashboard */}
        <Link
          href="/"
          className={cn(
            "nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
            pathname === "/"
              ? "active text-primary"
              : "text-text-violet-600 hover:text-text-primary"
          )}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Groups */}
        {navGroups.map((group) => (
          <div key={group.label} className="mt-5">
            {!collapsed ? (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-violet-600 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {group.icon}
                  {group.label}
                </span>
                {expandedGroups.includes(group.label) ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            ) : (
              <div className="flex justify-center py-1.5">
                <div className="w-5 h-px bg-border" />
              </div>
            )}

            {(collapsed || expandedGroups.includes(group.label)) && (
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === item.href || pathname.startsWith(item.href + "/")
                        ? "active text-primary"
                        : "text-text-violet-600 hover:text-text-primary"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text-violet-600 hover:bg-bg-muted transition-all text-sm"
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
