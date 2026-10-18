const fs = require('fs');

// 1. shared.ts
let shared = fs.readFileSync('src/cartilla/interactions/shared.ts', 'utf8');
shared = shared.replace(
  'export function fireCorrectFeedback() {\n  playCorrectChord();\n  gretelEvent("answer:correct");\n}',
  'export function fireCorrectFeedback(detail?: { itemId?: string }) {\n  playCorrectChord();\n  gretelEvent("answer:correct", detail);\n}'
);
shared = shared.replace(
  'export function fireWrongFeedback() {\n  playWrongBuzz();\n  gretelEvent("answer:wrong");\n}',
  'export function fireWrongFeedback(detail?: { itemId?: string }) {\n  playWrongBuzz();\n  gretelEvent("answer:wrong", detail);\n}'
);
fs.writeFileSync('src/cartilla/interactions/shared.ts', shared, 'utf8');

// 2. css
let css1 = fs.readFileSync('src/styles/workbook-pencil.css', 'utf8');
css1 = css1.replace(
  '  stroke-opacity: 1;\n  /* Owner',
  '  stroke-opacity: 1;\n  transition: stroke 0.5s ease-in-out;\n  /* Owner'
);
fs.writeFileSync('src/styles/workbook-pencil.css', css1, 'utf8');

let css2 = fs.readFileSync('src/styles/activity-mechanics.css', 'utf8');
if (!css2.includes('.am-direct-pencil__stroke')) {
  css2 += '\n\n.am-direct-pencil__stroke {\n  transition: stroke 0.5s ease-in-out, fill 0.5s ease-in-out;\n}\n';
  fs.writeFileSync('src/styles/activity-mechanics.css', css2, 'utf8');
}

// 3. WorkbookPencilMark.tsx
let wpm = fs.readFileSync('src/components/cartilla/WorkbookPencilMark.tsx', 'utf8');
wpm = wpm.replace(
  'import { useActivityEvents } from "@/lib/activity-events";',
  'import { useActivityEvents } from "@/lib/activity-events";\nimport { fireCorrectFeedback, fireWrongFeedback } from "@/cartilla/interactions/shared";'
);
wpm = wpm.replace(
  /  const result =\n    externalStatus === "correct"\n      \? "correct"\n      : isCorrect == null\n        \? undefined\n        : isCorrect\n          \? "correct"\n          : "wrong";/,
  `  const result =
    externalStatus === "correct"
      ? "correct"
      : currentStatus === "correct"
        ? "correct"
        : currentStatus === "erasing"
          ? "wrong"
          : undefined;`
);
const oldTimerBlock = `    const resultTimer = window.setTimeout(() => {
      if (isCorrect) {
        setInternalStatus("correct");
        emit(
          completeOnSuccess ? "activity:complete" : "answer:correct",
          itemId ? { itemId } : undefined,
        );
        onSuccessRef.current?.();
      } else {
        emit("answer:wrong", itemId ? { itemId } : undefined);
        setInternalStatus("erasing");
      }
    }, resultDelay);`;

const newTimerBlock = `    const resultTimer = window.setTimeout(() => {
      if (isCorrect) {
        setInternalStatus("correct");
        if (completeOnSuccess) {
          emit("activity:complete", itemId ? { itemId } : undefined);
        }
        fireCorrectFeedback(itemId ? { itemId } : undefined);
        onSuccessRef.current?.();
      } else {
        fireWrongFeedback(itemId ? { itemId } : undefined);
        setInternalStatus("erasing");
      }
    }, resultDelay);`;
wpm = wpm.replace(oldTimerBlock, newTimerBlock);
fs.writeFileSync('src/components/cartilla/WorkbookPencilMark.tsx', wpm, 'utf8');

// 4. PencilConnector.tsx
let pc = fs.readFileSync('src/cartilla/interactions/PencilConnector.tsx', 'utf8');
pc = pc.replace(
  'import { playCorrectChord } from "@/lib/piano-audio";',
  'import { fireCorrectFeedback, fireWrongFeedback } from "@/cartilla/interactions/shared";'
);
const oldAttemptConnect = `      if (isCorrect) {
        playCorrectChord();
        gretelEvent("answer:correct", { itemId: target.id });
        const next = new Set(marked).add(target.id);
        setMarked(next);
        persist([...next]);
        const count = [...next].filter((id) => !targets.find((t) => t.id === id)?.example).length;
        finishIfDone(count);
        onResult?.({ objectId: target.id, result: "correct" });
      } else {
        gretelEvent("answer:wrong", { itemId: target.id });
        recordWrong();
        const from = centerPt;
        const to = getTargetCenter(target.id);
        setWrongLine({ from, to, targetId: target.id });
        const retryDuration = reducedMotion
          ? WORKBOOK_MARK_TIMING.reducedEraseMs
          : WORKBOOK_MARK_TIMING.eraseMs;
        setTimeout(() => setWrongLine(null), retryDuration);
        onResult?.({ objectId: target.id, result: "wrong" });
      }`;

const newAttemptConnect = `      if (isCorrect) {
        const next = new Set(marked).add(target.id);
        setMarked(next);
        persist([...next]);
        const count = [...next].filter((id) => !targets.find((t) => t.id === id)?.example).length;

        const delay = reducedMotion ? WORKBOOK_MARK_TIMING.holdMs : WORKBOOK_MARK_TIMING.drawMs + WORKBOOK_MARK_TIMING.holdMs;
        setTimeout(() => {
          fireCorrectFeedback({ itemId: target.id });
          finishIfDone(count);
          onResult?.({ objectId: target.id, result: "correct" });
        }, delay);
      } else {
        recordWrong();
        const from = centerPt;
        const to = getTargetCenter(target.id);
        setWrongLine({ from, to, targetId: target.id });

        const delay = reducedMotion ? WORKBOOK_MARK_TIMING.holdMs : WORKBOOK_MARK_TIMING.drawMs + WORKBOOK_MARK_TIMING.holdMs;
        setTimeout(() => {
          fireWrongFeedback({ itemId: target.id });
        }, delay);

        const retryDuration = reducedMotion
          ? WORKBOOK_MARK_TIMING.reducedEraseMs
          : WORKBOOK_MARK_TIMING.eraseMs;
        setTimeout(() => setWrongLine(null), retryDuration);
        onResult?.({ objectId: target.id, result: "wrong" });
      }`;
pc = pc.replace(oldAttemptConnect, newAttemptConnect);

const oldAttemptPairConnect = `      if (isCorrect) {
        playCorrectChord();
        gretelEvent("answer:correct", { itemId: pairKey });
        const next = new Set(marked).add(pairKey);
        setMarked(next);
        persist([...next]);
        const count = [...next].filter((id) => !id.includes("example")).length;
        finishIfDone(count);
        setSelectedStartId(null);
        onResult?.({ objectId: pairKey, result: "correct" });
      } else {
        gretelEvent("answer:wrong", { itemId: right.id });
        recordWrong();
        const from = getTargetCenter(left.id);
        const to = getTargetCenter(right.id);
        setWrongLine({ from, to, targetId: right.id });
        const retryDuration = reducedMotion
          ? WORKBOOK_MARK_TIMING.reducedEraseMs
          : WORKBOOK_MARK_TIMING.eraseMs;
        setTimeout(() => setWrongLine(null), retryDuration);
        onResult?.({ objectId: right.id, result: "wrong" });
      }`;

const newAttemptPairConnect = `      if (isCorrect) {
        const next = new Set(marked).add(pairKey);
        setMarked(next);
        persist([...next]);
        const count = [...next].filter((id) => !id.includes("example")).length;
        setSelectedStartId(null);

        const delay = reducedMotion ? WORKBOOK_MARK_TIMING.holdMs : WORKBOOK_MARK_TIMING.drawMs + WORKBOOK_MARK_TIMING.holdMs;
        setTimeout(() => {
          fireCorrectFeedback({ itemId: pairKey });
          finishIfDone(count);
          onResult?.({ objectId: pairKey, result: "correct" });
        }, delay);
      } else {
        recordWrong();
        const from = getTargetCenter(left.id);
        const to = getTargetCenter(right.id);
        setWrongLine({ from, to, targetId: right.id });

        const delay = reducedMotion ? WORKBOOK_MARK_TIMING.holdMs : WORKBOOK_MARK_TIMING.drawMs + WORKBOOK_MARK_TIMING.holdMs;
        setTimeout(() => {
          fireWrongFeedback({ itemId: right.id });
        }, delay);

        const retryDuration = reducedMotion
          ? WORKBOOK_MARK_TIMING.reducedEraseMs
          : WORKBOOK_MARK_TIMING.eraseMs;
        setTimeout(() => setWrongLine(null), retryDuration);
        onResult?.({ objectId: right.id, result: "wrong" });
      }`;
pc = pc.replace(oldAttemptPairConnect, newAttemptPairConnect);

const oldCentral = `                  <line
                    x1={centerPt.x}
                    y1={centerPt.y}
                    x2={targetPt.x}
                    y2={targetPt.y}
                    stroke="#0d9488"
                    strokeWidth={isExample ? 3 : 4.5}
                    strokeDasharray={isExample ? "6 4" : undefined}
                    strokeLinecap="round"
                    filter={\`url(#\${shadowUid})\`}
                  />
                  <circle cx={targetPt.x} cy={targetPt.y} r={isExample ? 4 : 5.5} fill="#0d9488" />
                  <circle cx={centerPt.x} cy={centerPt.y} r={4} fill="#0d9488" />`;
const newCentral = `                  <line
                    x1={centerPt.x}
                    y1={centerPt.y}
                    x2={targetPt.x}
                    y2={targetPt.y}
                    stroke="#16a34a"
                    strokeWidth={isExample ? 3 : 4.5}
                    strokeDasharray={isExample ? "6 4" : undefined}
                    strokeLinecap="round"
                    filter={\`url(#\${shadowUid})\`}
                  >
                    <animate attributeName="stroke" from="#46464d" to="#16a34a" dur="0.5s" fill="freeze" />
                  </line>
                  <circle cx={targetPt.x} cy={targetPt.y} r={isExample ? 4 : 5.5} fill="#16a34a">
                    <animate attributeName="fill" from="#46464d" to="#16a34a" dur="0.5s" fill="freeze" />
                  </circle>
                  <circle cx={centerPt.x} cy={centerPt.y} r={4} fill="#16a34a">
                    <animate attributeName="fill" from="#46464d" to="#16a34a" dur="0.5s" fill="freeze" />
                  </circle>`;
pc = pc.replace(oldCentral, newCentral);

const oldPair = `                  <line
                    x1={ptA.x}
                    y1={ptA.y}
                    x2={ptB.x}
                    y2={ptB.y}
                    stroke="#0d9488"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    filter={\`url(#\${shadowUid})\`}
                  />
                  <circle cx={ptA.x} cy={ptA.y} r={5} fill="#0d9488" />
                  <circle cx={ptB.x} cy={ptB.y} r={5} fill="#0d9488" />`;
const newPair = `                  <line
                    x1={ptA.x}
                    y1={ptA.y}
                    x2={ptB.x}
                    y2={ptB.y}
                    stroke="#16a34a"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    filter={\`url(#\${shadowUid})\`}
                  >
                    <animate attributeName="stroke" from="#46464d" to="#16a34a" dur="0.5s" fill="freeze" />
                  </line>
                  <circle cx={ptA.x} cy={ptA.y} r={5} fill="#16a34a">
                    <animate attributeName="fill" from="#46464d" to="#16a34a" dur="0.5s" fill="freeze" />
                  </circle>
                  <circle cx={ptB.x} cy={ptB.y} r={5} fill="#16a34a">
                    <animate attributeName="fill" from="#46464d" to="#16a34a" dur="0.5s" fill="freeze" />
                  </circle>`;
pc = pc.replace(oldPair, newPair);

const oldDrag = `              <line
                x1={activeStartPt.x}
                y1={activeStartPt.y}
                x2={dragPt.x}
                y2={dragPt.y}
                stroke="#0d9488"
                strokeWidth={5}
                strokeLinecap="round"
                filter={\`url(#\${shadowUid})\`}
              />
              <circle cx={dragPt.x} cy={dragPt.y} r={6} fill="#0f766e" />`;
const newDrag = `              <line
                x1={activeStartPt.x}
                y1={activeStartPt.y}
                x2={dragPt.x}
                y2={dragPt.y}
                stroke="#46464d" style={{ transition: "stroke 0.5s ease-in-out" }}
                strokeWidth={5}
                strokeLinecap="round"
                filter={\`url(#\${shadowUid})\`}
              />
              <circle cx={dragPt.x} cy={dragPt.y} r={6} fill="#46464d" style={{ transition: "fill 0.5s ease-in-out" }} />`;
pc = pc.replace(oldDrag, newDrag);

const oldRetryRed = `                <line
                  className="am-direct-pencil__retry-line"
                  x1={wrongLine.from.x}
                  y1={wrongLine.from.y}
                  x2={wrongLine.to.x}
                  y2={wrongLine.to.y}
                  stroke="#0d9488"
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity="0.6"
                />`;
const newRetryRed = `                <line
                  className="am-direct-pencil__retry-line"
                  x1={wrongLine.from.x}
                  y1={wrongLine.from.y}
                  x2={wrongLine.to.x}
                  y2={wrongLine.to.y}
                  stroke="#dc2626"
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity="0.6"
                />`;
pc = pc.replace(oldRetryRed, newRetryRed);

const oldRetryPath = `                      <path
                        d={linePath}
                        stroke="#0d9488"
                        strokeWidth={4}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="100 100"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          dur={\`\${eraseMs}ms\`}
                          fill="freeze"
                          values="0;0;100;100"
                          keyTimes={\`0;\${kFlip};\${kRubbed};1\`}
                        />
                      </path>`;
const newRetryPath = `                      <path
                        d={linePath}
                        stroke="#dc2626"
                        strokeWidth={4}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="100 100"
                      >
                        <animate
                          attributeName="stroke"
                          dur={\`\${eraseMs}ms\`}
                          fill="freeze"
                          values="#46464d;#dc2626;#dc2626"
                          keyTimes={\`0;\${kFlip};1\`}
                        />
                        <animate
                          attributeName="stroke-dashoffset"
                          dur={\`\${eraseMs}ms\`}
                          fill="freeze"
                          values="0;0;100;100"
                          keyTimes={\`0;\${kFlip};\${kRubbed};1\`}
                        />
                      </path>`;
pc = pc.replace(oldRetryPath, newRetryPath);

fs.writeFileSync('src/cartilla/interactions/PencilConnector.tsx', pc, 'utf8');

// 5. tests
let tests = fs.readFileSync('src/cartilla/interactions/__tests__/PencilConnector.test.tsx', 'utf8');
tests = tests.replace(/await flushAnim\(300\);/g, 'await flushAnim(1000);');
tests = tests.replace(/await flushAnim\(200\);/g, 'await flushAnim(1000);');
tests = tests.replace(/await flushAnim\(150\);/g, 'await flushAnim(1000);');

const replaceTest = `    fireEvent.click(screen.getByRole("button", { name: "oso" }));

    expect(playWrongBuzz).not.toHaveBeenCalled();
    expect(speakGretelPhrase).not.toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "2" });
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-connected")).toBe(false);
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-retry")).toBe(true);
    expect(container.querySelector(".am-direct-pencil__retry-line")).toBeTruthy();

    await flushAnim(1000);
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-retry")).toBe(false);`;

const newTest = `    fireEvent.click(screen.getByRole("button", { name: "oso" }));

    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-retry")).toBe(true);
    expect(container.querySelector(".am-direct-pencil__retry-line")).toBeTruthy();

    await flushAnim(1000);

    expect(playWrongBuzz).toHaveBeenCalled();
    expect(speakGretelPhrase).not.toHaveBeenCalled();
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "2" });
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-connected")).toBe(false);
    expect(screen.getByRole("button", { name: "oso" }).classList.contains("is-retry")).toBe(false);`;
tests = tests.replace(replaceTest, newTest);

fs.writeFileSync('src/cartilla/interactions/__tests__/PencilConnector.test.tsx', tests, 'utf8');

console.log('done');
