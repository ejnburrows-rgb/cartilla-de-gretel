export function AnalyticsPanel() {
  return (
    <div className="crm-card">
      <h3 className="text-lg font-bold mb-4">Actividad reciente</h3>
      <div className="h-48 flex items-end justify-between gap-2 border-b border-[#e8e2d9] pb-2">
        {/* Simple mock bar chart */}
        {[30, 45, 25, 60, 80, 50, 90].map((height, i) => {
          const barStyle: React.CSSProperties = { height: `${height}%` };
          return (
            <div key={i} className="w-full bg-[#dce7d5] hover:bg-[#8da47e] rounded-t transition-colors relative group" style={barStyle}>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3a322b] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {height}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-[#7a7065] font-medium">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mié</span>
        <span>Jue</span>
        <span>Vie</span>
        <span>Sáb</span>
        <span>Dom</span>
      </div>
    </div>
  );
}
