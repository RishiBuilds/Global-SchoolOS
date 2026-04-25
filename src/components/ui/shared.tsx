import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Page Header ── */
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-[18px] h-[18px] text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-lg lg:text-xl font-semibold text-text-primary">{title}</h1>
          {description && <p className="text-sm text-text-violet-600 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ── Stat Card ── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color: "blue" | "green" | "purple" | "amber";
}

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-l-blue-500" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-l-emerald-500" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", border: "border-l-violet-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-500" },
};

export function StatCard({ label, value, icon: Icon, trend, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("bg-white rounded-xl border border-border p-5 border-l-[3px]", c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-violet-600">{label}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trend.positive ? "text-emerald-600" : "text-danger")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", c.bg)}>
          <Icon className={cn("w-[18px] h-[18px]", c.text)} />
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ── */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-xl bg-bg-muted border border-border flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-violet-600 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Button ── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-white hover:bg-bg-muted text-text-primary border border-border",
    danger: "bg-danger hover:bg-danger/90 text-white",
    ghost: "bg-transparent hover:bg-bg-muted text-text-violet-600 hover:text-text-primary",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-5 py-2.5 text-sm rounded-lg",
  };
  return (
    <button
      className={cn(
        "font-medium transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
