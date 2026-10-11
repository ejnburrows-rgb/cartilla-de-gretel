import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const targets = [["src/components/rewards/BadgeGrid.tsx", 1], ["src/components/rewards/StickerReel.tsx", 1], ["src/features/teacher-crm/components/PipelineBoard.tsx", 3]];
for (const [path, count] of targets) {
  test(path + " exposes keyboard focus and activation", () => {
    const code = readFileSync(new URL("../" + path, import.meta.url), "utf8");
    const required = ['role="button"', "tabIndex={0}", "onKeyDown={(event) => {", 'event.key === "Enter" || event.key === " "', "focus-visible:outline"];
    for (const word of required) assert.ok(code.split(word).length - 1 >= count, `${path} missing ${word}`);
  });
}
