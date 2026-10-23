import { performance } from 'perf_hooks';

// Simulate data
const attentionRows = [];
const studentLearning = Array.from({ length: 1000 }, (_, i) => ({
  student: { id: `stu_${i}` },
  insight: {
    recommendation: i === 999 ? true : false,
  }
}));

// Simulate a component rendering 10000 times (e.g. typing in an input causing re-renders)
const renderCount = 10000;

function benchmarkUnoptimized() {
  let result;
  for (let i = 0; i < renderCount; i++) {
    // Current behavior: .find is called on every render
    const nextAction = attentionRows[0] ?? studentLearning.find((row) => row.insight?.recommendation);
    result = nextAction;
  }
  return result;
}

function benchmarkOptimized() {
  let result;
  let cachedNextAction;
  let cacheKey = null;

  for (let i = 0; i < renderCount; i++) {
    // Simulated useMemo
    if (cacheKey !== studentLearning) {
      cachedNextAction = attentionRows[0] ?? studentLearning.find((row) => row.insight?.recommendation);
      cacheKey = studentLearning; // in real life, dependencies check happens here
    }
    result = cachedNextAction;
  }
  return result;
}

const t0 = performance.now();
benchmarkUnoptimized();
const t1 = performance.now();
const timeUnoptimized = t1 - t0;
console.log(`Unoptimized Render Iteration: ${timeUnoptimized.toFixed(2)} ms`);

const t2 = performance.now();
benchmarkOptimized();
const t3 = performance.now();
const timeOptimized = t3 - t2;
console.log(`Optimized (Memoized) Render Iteration: ${timeOptimized.toFixed(2)} ms`);

const improvement = timeUnoptimized / timeOptimized;
console.log(`Improvement: ${improvement.toFixed(2)}x faster`);
