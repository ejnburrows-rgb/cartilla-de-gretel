const fs = require('fs');
const file = 'src/lib/__tests__/activity-completion-foundation.test.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
    let events = [];
    const _oldRecord = window.recordEvent; // pseudo
    window.addEventListener('gretel:activity-event', (e) => events.push(e.detail.name));

    for (const word of ['oveja', 'ojos', 'oreja', 'olla', 'oso']) await tap(word);

    const getStats = () => {
      const progress = loadLassoProgress('2:p5-match');
      const marked = progress?.completedIds ?? [];
      const pendingLines = document.querySelectorAll('.workbook-pencil__shape:not([data-example="true"])').length; // approximation
      const completedCount = document.querySelectorAll('[aria-pressed="true"]').length;
      return { marked, pendingLines, completedCount, events: [...events] };
    };

    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    console.log("At 700ms:", getStats(), "locked:", next().hasAttribute('aria-disabled'));

    await act(async () => { await vi.advanceTimersByTimeAsync(800); });
    console.log("At 1500ms:", getStats(), "locked:", next().hasAttribute('aria-disabled'));

    await act(async () => { await vi.advanceTimersByTimeAsync(3500); });
    console.log("At 5000ms:", getStats(), "locked:", next().hasAttribute('aria-disabled'));

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
`;

code = code.replace(
  "    for (const word of ['oveja', 'ojos', 'oreja', 'olla', 'oso']) await tap(word);\n    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });",
  replacement
);

fs.writeFileSync(file, code);
