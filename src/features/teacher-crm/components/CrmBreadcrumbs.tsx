import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

/** Shared breadcrumb trail for the Panel → Clase → Estudiante → Lección
 * drill-down. Every crumb except the last is a real link (not just visual
 * state), so a teacher can jump back up a level without hitting "back". */
export function CrmBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-4 no-print flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-stone-300 shrink-0" />}
            {!isLast && item.to ? (
              <Link
                to={item.to as never}
                params={item.params as never}
                className="hover:text-vowel-a hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-stone-800" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
