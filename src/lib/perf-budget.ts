export const PERF_BUDGETS = {
  lcpTargetMs: 2500, // < 2.5s on 4G
  tbtTargetMs: 200,  // < 200ms
  jsTotalGzipBudgetKb: 800, // 800KB gzip total
  imageGzipBudgetKb: 200,   // 200KB gzip per route
  fontGzipBudgetKb: 100,    // 100KB total
};

export function checkPerfMetric(metric: "LCP" | "TBT", value: number): { passed: boolean; message: string } {
  if (metric === "LCP") {
    const passed = value < PERF_BUDGETS.lcpTargetMs;
    return {
      passed,
      message: passed 
        ? `LCP metric passed budget check: ${value}ms < ${PERF_BUDGETS.lcpTargetMs}ms`
        : `LCP metric exceeded budget! Target is < 2.5s, current is ${(value / 1000).toFixed(2)}s`,
    };
  } else {
    const passed = value < PERF_BUDGETS.tbtTargetMs;
    return {
      passed,
      message: passed
        ? `TBT metric passed budget check: ${value}ms < ${PERF_BUDGETS.tbtTargetMs}ms`
        : `TBT metric exceeded budget! Target is < 200ms, current is ${value}ms`,
    };
  }
}
