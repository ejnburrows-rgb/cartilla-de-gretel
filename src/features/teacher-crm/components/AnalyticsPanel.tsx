import { useQuery } from "@tanstack/react-query";
import { getWeeklyActivity } from "@/lib/teacher.functions";

interface AnalyticsPanelProps {
  classId?: string;
  isSeed?: boolean;
}

export function AnalyticsPanel({ classId, isSeed }: AnalyticsPanelProps) {
  const { data: days, isLoading } = useQuery({
    queryKey: ["weekly-activity", classId],
    queryFn: () => getWeeklyActivity({ data: { classId: classId! } }),
    enabled: !isSeed && !!classId,
  });

  const maxCount = Math.max(1, ...(days ?? []).map((d) => d.count));

  return (
    <div className="crm-card">
      <h3 className="text-lg font-bold mb-4">Actividad reciente</h3>
      {isSeed ? (
        <p className="text-sm font-bold text-stone-400 text-center py-8">
          La actividad real no está disponible en modo de práctica local.
        </p>
      ) : isLoading || !days ? (
        <div className="h-48 flex items-center justify-center text-sm font-bold text-stone-400 animate-pulse">
          Cargando actividad…
        </div>
      ) : (
        <>
          <div className="h-48 flex items-end justify-between gap-2 border-b border-[#e8e2d9] pb-2">
            {days.map((day, i) => {
              const heightPct = Math.round((day.count / maxCount) * 100);
              const barStyle: React.CSSProperties = {
                height: `${Math.max(heightPct, day.count > 0 ? 6 : 2)}%`,
              };
              return (
                <div
                  key={i}
                  className="w-full bg-[#dce7d5] hover:bg-[#8da47e] rounded-t transition-colors relative group"
                  style={barStyle}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3a322b] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#7a7065] font-medium">
            {days.map((day, i) => (
              <span key={i}>{day.label}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
