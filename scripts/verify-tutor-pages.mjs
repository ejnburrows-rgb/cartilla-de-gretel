#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const asset = (path) => existsSync(new URL(`../public/${path.replace(/^\//, "")}`, import.meta.url));
const pad = (number) => String(number).padStart(3, "0");
const lessons = Array.from({ length: 24 }, (_, index) =>
  read(`src/content/tutor-graph/lesson-${String(index + 1).padStart(2, "0")}.json`),
);
const flipchartText = Object.assign(
  {},
  ...["3-22", "23-42", "43-62"].map((range) => read(`src/data/flipchart-text-${range}.json`)),
);
const workbookLayouts = read("src/data/page-layouts.json").pages;
const recordedLines = new Map(read("src/content/tutor-lines.json").approved.map((line) =>
  [line.lineId, line.src],
));
const frontMatter = {
  1: ["La Cartilla de Gretel", "Autora: Leonor Lopetegui"],
  2: ["Copyright © 2004", "Revisión 2010", "Leonor Lopetegui"],
};
const compact = (text) => text.normalize("NFC").toLocaleLowerCase("es").replace(/[^\p{L}\p{N}]/gu, "");
const textInRegions = (page) => (workbookLayouts[page]?.regions ?? [])
  .filter((region) => !["footer", "page-number"].includes(region.regionType))
  .flatMap((region) => [region.text, ...(region.sentences ?? [])])
  .filter(Boolean);
const sizes = { desktop: { width: 1366, height: 768 }, phone: { width: 390, height: 844 } };

function expectedSpeech(items) {
  return items.map((item) => {
    const recording = item.approvedAudioSrc ?? recordedLines.get(item.tutorLineId) ?? null;
    return {
      text: item.text ?? item.word,
      recording,
      delivery: recording && asset(recording) ? "recorded model" : "text only",
    };
  });
}

const workbook = lessons.flatMap((lesson) =>
  lesson.pages.map((page) => ({
    id: `WB-${pad(page.printedPage)}`,
    number: page.printedPage,
    lesson: lesson.lesson,
    sourceExists: asset(`cartilla/art/source/workbook/page-${pad(page.printedPage)}.jpg`),
    expectedContent: textInRegions(page.printedPage).join(" | ") || page.prompt || page.exerciseId,
    textRegions: textInRegions(page.printedPage),
    teachingAction: page.status === "absent-in-source" ? "skip unavailable original" : page.exerciseKind,
    expectedSpeech: expectedSpeech(lesson.items.filter((item) => item.printedPage === page.printedPage)),
    desktop: "NOT TESTED",
    phone: "NOT TESTED",
  })),
);
const flipchart = read("src/data/teacher-flipchart.json").pages.map((sheet) => {
  const lesson = lessons.find((entry) => entry.lesson === sheet.lesson);
  const text = frontMatter[sheet.flipchartPage] ?? [...new Set(
    (flipchartText[sheet.flipchartPage] ?? []).map((block) => block.text.trim()).filter(Boolean),
  )];
  return {
    id: `FC-${pad(sheet.flipchartPage)}`,
    number: sheet.flipchartPage,
    lesson: sheet.lesson || null,
    sourceExists: asset(sheet.path),
    expectedContent: text.join(" | "),
    textRegions: text,
    teachingAction: lesson ? "present the sheet and point to its curriculum targets" : "show front matter",
    expectedSpeech: expectedSpeech(
      lesson?.flipchartVocab.filter((item) => item.flipchartPage === sheet.flipchartPage) ?? [],
    ),
    desktop: "NOT TESTED",
    phone: "NOT TESTED",
  };
});

const rows = [...workbook, ...flipchart];
assert.deepEqual(workbook.map((row) => row.number), Array.from({ length: 90 }, (_, index) => index + 1));
assert.deepEqual(flipchart.map((row) => row.number), Array.from({ length: 62 }, (_, index) => index + 1));
assert.deepEqual(workbook.filter((row) => !row.sourceExists).map((row) => row.number), [86, 87]);
assert.ok(flipchart.every((row) => row.sourceExists), "All Flip Chart sources must be present");

const [base, output] = process.argv.slice(2);
if (!output) throw new Error("Usage: node scripts/verify-tutor-pages.mjs <preview-url|--sources-only> <results.json>");

function save() {
  writeFileSync(output, `${JSON.stringify({ base, sizes, rows }, null, 2)}\n`);
}

async function checkRegions(root, row) {
  await expect(root).toBeVisible({ timeout: 12000 });
  const rendered = compact(await root.innerText());
  const missing = row.textRegions.filter((region) => !rendered.includes(compact(region)));
  assert.deepEqual(missing, [], `Source text missing from rendered ${row.id}`);
}

async function walk(available, size, checkPage, forward, backward) {
  for (const [index, row] of available.entries()) {
    try {
      await checkPage(row, index);
      if (index < available.length - 1) await expect(forward).toBeEnabled();
      if (index > 0) await expect(backward).toBeEnabled();
      row[size] = "visible page and navigation controls checked";
      if (index < available.length - 1) await forward.click();
    } catch (error) {
      row[size] = `FAILED: ${error.message.split("\n")[0]}`;
      break;
    }
  }
}

if (base === "--sources-only") {
  save();
} else {
  const browser = await chromium.launch({
    executablePath: process.env.TUTOR_CHROME_PATH || undefined,
    proxy: process.env.TUTOR_PROXY_SERVER ? { server: process.env.TUTOR_PROXY_SERVER } : undefined,
  });
  try {
    await Promise.all(Object.entries(sizes).map(async ([size, viewport]) => {
      const context = await browser.newContext({
        viewport, reducedMotion: "reduce",
        ignoreHTTPSErrors: process.env.TUTOR_TEST_IGNORE_CERT_ERRORS === "1",
      });
      try {
        const book = await context.newPage();
        const chart = await context.newPage();
        await Promise.all([
          (async () => {
            await book.goto(new URL("/cartilla/cuaderno", base).href);
            const visible = (row) => book.locator(`[data-native-page="${row.number}"]`);
            const next = book.getByTestId("button-next");
            const previous = book.getByTestId("button-prev");
            await walk(
              workbook.filter((row) => row.sourceExists), size,
              (row) => checkRegions(visible(row).locator(".native-lesson-viewer__content").first(), row),
              next, previous,
            );
            await expect(visible(workbook.at(-1))).toBeVisible();
            await book.reload();
            await expect(visible(workbook.at(-1))).toBeVisible();
            await previous.click();
            await expect(visible(workbook.at(-2))).toBeVisible();
          })(),
          (async () => {
            const url = new URL("/cartilla/presentar/1", base);
            url.searchParams.set("sheets", flipchart.map((row) => row.number).join(","));
            await chart.goto(url.href);
            const counter = chart.getByTestId("flipchart-counter");
            const checkSheet = async (row, index) => {
              await expect(counter.getByText(
                `Hoja ${index + 1} de ${flipchart.length}`,
                { exact: true },
              )).toBeVisible({ timeout: 12000 });
              await expect(counter).toContainText(`Lámina ${row.number} · Lección ${row.lesson ?? 0}`);
              await checkRegions(chart.locator(".fc-board__page-inner"), row);
            };
            const previous = chart.getByRole("button", { name: "Lámina anterior", exact: true });
            await walk(flipchart, size, checkSheet,
              chart.getByRole("button", { name: "Lámina siguiente", exact: true }),
              previous,
            );
            await previous.click();
            await checkSheet(flipchart.at(-2), flipchart.length - 2);
          })(),
        ]);
      } finally {
        await context.close();
      }
    }));
  } finally {
    save();
    await browser.close();
  }
  assert.ok(rows.filter((row) => row.sourceExists).every((row) =>
    Object.keys(sizes).every((size) => row[size] === "visible page and navigation controls checked"),
  ), `Review incomplete results in ${output}`);
}
