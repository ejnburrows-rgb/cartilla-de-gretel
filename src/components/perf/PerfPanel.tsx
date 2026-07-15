import React, { useEffect, useState } from "react";
import { localMonitor } from "../../lib/local-monitor";
import { checkPerfMetric, PERF_BUDGETS } from "../../lib/perf-budget";

export function PerfPanel() {
  // Only render in dev mode
  if (!import.meta.env.DEV) return null;

  const [lcp, setLcp] = useState<number | null>(null);
  const [tbt, setTbt] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Read errors count
    setErrorsCount(localMonitor.getErrors().length);

    // 2. Observe LCP
    let lcpObserver: PerformanceObserver | null = null;
    try {
      lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          setLcp(lastEntry.startTime);
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}

    // 3. Estimate TBT via Long Tasks
    let tbtObserver: PerformanceObserver | null = null;
    try {
      tbtObserver = new PerformanceObserver((entryList) => {
        let blockTime = 0;
        for (const entry of entryList.getEntries()) {
          // Blocking time is duration exceeding 50ms
          if (entry.duration > 50) {
            blockTime += entry.duration - 50;
          }
        }
        setTbt((prev) => prev + blockTime);
      });
      tbtObserver.observe({ type: "longtask", buffered: true });
    } catch {}

    return () => {
      lcpObserver?.disconnect();
      tbtObserver?.disconnect();
    };
  }, []);

  const handleClearErrors = () => {
    localMonitor.clearErrors();
    setErrorsCount(0);
  };

  const lcpCheck =
    lcp !== null ? checkPerfMetric("LCP", lcp) : { passed: true, message: "Measuring..." };
  const tbtCheck = checkPerfMetric("TBT", tbt);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[999999] p-2 bg-slate-900 border border-slate-700 text-amber-400 rounded-full shadow-lg font-mono text-xs font-bold hover:scale-105 transition cursor-pointer"
      >
        ⚡ Perf
      </button>
    );
  }

  return (
    <div className="perf-diag-overlay">
      <div className="perf-diag-title">
        <span>⚡ Gretel Diagnostics</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-stone-400 hover:text-white font-bold ml-2 cursor-pointer"
        >
          [x]
        </button>
      </div>

      <div className="perf-diag-row">
        <span>LCP (Target &lt; 2.5s):</span>
        <span className={lcpCheck.passed ? "perf-diag-metric-pass" : "perf-diag-metric-fail"}>
          {lcp !== null ? `${(lcp / 1000).toFixed(2)}s` : "Pending"}
        </span>
      </div>

      <div className="perf-diag-row">
        <span>TBT (Target &lt; 200ms):</span>
        <span className={tbtCheck.passed ? "perf-diag-metric-pass" : "perf-diag-metric-fail"}>
          {tbt.toFixed(0)}ms
        </span>
      </div>

      <div className="perf-diag-row">
        <span>JS Total Budget:</span>
        <span className="text-amber-400 font-bold">{PERF_BUDGETS.jsTotalGzipBudgetKb}KB</span>
      </div>

      <div className="perf-diag-row">
        <span>Local Errors:</span>
        <span className={errorsCount === 0 ? "perf-diag-metric-pass" : "perf-diag-metric-fail"}>
          {errorsCount}
        </span>
      </div>

      {errorsCount > 0 && (
        <div className="mt-2 border-t border-slate-700 pt-2 flex justify-between items-center">
          <button
            onClick={handleClearErrors}
            className="text-[0.6rem] bg-red-950 text-red-300 hover:bg-red-900 px-2 py-0.5 rounded cursor-pointer"
          >
            Clear Log
          </button>
          <span className="text-[0.6rem] text-slate-400">Showing last 50</span>
        </div>
      )}
    </div>
  );
}

export default PerfPanel;
