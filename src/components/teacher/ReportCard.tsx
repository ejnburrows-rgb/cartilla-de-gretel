import type { ReactNode } from "react";

type ReportCardTone = "neutral" | "blue" | "green" | "amber" | "rose";

type ReportCardProps = {
  title: string;
  value?: string | number;
  subtitle?: string;
  tone?: ReportCardTone;
  actions?: ReactNode;
  children?: ReactNode;
};

const toneClasses: Record<ReportCardTone, string> = {
  neutral: "border-slate-200 bg-white",
  blue: "border-sky-200 bg-sky-50",
  green: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  rose: "border-rose-200 bg-rose-50",
};

export function ReportCard({
  title,
  value,
  subtitle,
  tone = "neutral",
  actions,
  children,
}: ReportCardProps) {
  return (
    <section className={`teacher-report-card rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">{title}</h2>
          {value !== undefined && (
            <p className="mt-2 text-3xl font-black leading-none text-slate-950">{value}</p>
          )}
          {subtitle && <p className="mt-2 text-sm font-semibold text-slate-600">{subtitle}</p>}
        </div>
        {actions && <div className="teacher-report-no-print flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
