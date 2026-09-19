import React from "react";

export function SuspenseFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-stone-50 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-3xl border border-stone-100 dark:border-slate-700/60 shadow-2xl flex flex-col items-center gap-6 animate-pulse">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <div className="w-full flex flex-col items-center gap-2">
          <div className="h-6 w-2/3 bg-stone-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-1/2 bg-stone-100 dark:bg-slate-700/60 rounded-lg" />
        </div>
        <div className="w-full flex flex-col gap-3">
          <div className="h-12 w-full bg-stone-100 dark:bg-slate-800/40 rounded-2xl" />
          <div className="h-12 w-full bg-stone-100 dark:bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
export default SuspenseFallback;
