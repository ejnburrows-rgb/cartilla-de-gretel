const fs = require('fs');
const file = 'src/lib/__tests__/activity-completion-foundation.test.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
    for (const word of ['oveja', 'ojos', 'oreja', 'olla', 'oso']) await tap(word);

    // Check at 700ms
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    console.log("At 700ms: locked =", next().hasAttribute('aria-disabled'));

    // Check at 1500ms
    await act(async () => { await vi.advanceTimersByTimeAsync(800); });
    console.log("At 1500ms: locked =", next().hasAttribute('aria-disabled'));

    // Check at 5s
    await act(async () => { await vi.advanceTimersByTimeAsync(3500); });
    console.log("At 5000ms: locked =", next().hasAttribute('aria-disabled'));

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
`;

code = code.replace(
  "    for (const word of ['oveja', 'ojos', 'oreja', 'olla', 'oso']) await tap(word);\n    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });",
  replacement
);

fs.writeFileSync(file, code);
