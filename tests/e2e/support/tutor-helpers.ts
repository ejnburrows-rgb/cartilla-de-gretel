/**
 * Shared helpers for the tutor e2e lane (StubEars scripted runs).
 *
 * Everything the runtime renders lives behind the data attributes of the
 * landed W6 components (`[data-tutor-mic]`, `[data-tutor-unavailable]`,
 * `[data-tutor-stage]`, …), so these helpers are the single adaptation
 * point if the session screen's DOM evolves.
 */
import { expect, type Page } from "@playwright/test";

/** StubEars script key (STUB SCRIPT CONTRACT — src/lib/tutor-ears-stub.ts). */
export const TUTOR_EARS_KEY = "cartilla.tutor.test-ears.v1";
/** On-device progress log key (src/lib/tutor-progress.ts). */
export const TUTOR_PROGRESS_KEY = "cartilla.tutor.progress.v1";
/** On-device per-slot memory key (src/lib/tutor-memory.ts). */
export const TUTOR_MEMORY_KEY = "cartilla.tutor.memory.v1";
/** Offline-pack completion marker key (src/lib/tutor-offline-pack.ts). */
export const TUTOR_PACK_MARKER_KEY = "cartilla.tutor.pack.v1";

export type StubProbe = "ready" | "denied" | "no-local" | "no-microphone" | "unsupported" | "failed";

export interface StubQueueItem {
  ok?: boolean;
  transcript?: string;
  alternatives?: string[];
  problem?: "unsupported" | "no-local" | "denied" | "no-microphone" | "no-speech" | "failed";
  holdMs?: number;
}

export interface StubScript {
  probe?: StubProbe;
  probeDelayMs?: number;
  queue?: StubQueueItem[];
}

/** Script StubEars mid-session (read fresh at each probe()/listen()). */
export async function scriptEars(page: Page, script: StubScript): Promise<void> {
  await page.evaluate(
    ({ key, json }) => {
      window.localStorage.setItem(key, json);
    },
    { key: TUTOR_EARS_KEY, json: JSON.stringify(script) },
  );
}

/**
 * Script StubEars BEFORE the app boots (needed when the probe outcome itself
 * is scripted, e.g. probe "denied"). Runs on every navigation of the page.
 */
export function initScriptEars(page: Page, script: StubScript): void {
  page.addInitScript(
    ({ key, json }) => {
      try {
        window.localStorage.setItem(key, json);
      } catch {
 /* a fresh origin before first commit — the goto() that follows re-runs this */
      }
    },
    { key: TUTOR_EARS_KEY, json: JSON.stringify(script) },
  );
}

/**
 * Block + count every real getUserMedia call. StubEars must never open the
 * mic; any count > 0 is a defect (a real engine ran inside the e2e lane).
 */
export function stubGetUserMedia(page: Page): void {
  page.addInitScript(() => {
    const w = window as unknown as { __gumCalls?: number };
    w.__gumCalls = 0;
    const md = navigator.mediaDevices;
    if (md && typeof md.getUserMedia === "function") {
      Object.defineProperty(md, "getUserMedia", {
        configurable: true,
        value: () => {
          w.__gumCalls = (w.__gumCalls ?? 0) + 1;
          return Promise.reject(new DOMException("getUserMedia blocked by e2e", "NotAllowedError"));
        },
      });
    }
  });
}

export async function gumCallCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __gumCalls?: number }).__gumCalls ?? 0);
}

/** Collect console errors + uncaught page errors. */
export function trackConsoleErrors(page: Page): { errors: () => string[] } {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return { errors: () => errors };
}

/** Collect every request URL seen by the page. */
export function trackRequests(page: Page): { urls: () => string[] } {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  return { urls: () => urls };
}

/** Read the on-device progress log (parsed; [] when absent/corrupt). */
export async function readProgressEvents(page: Page): Promise<Array<Record<string, unknown>>> {
  return page.evaluate((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : [];
    } catch {
      return [];
    }
  }, TUTOR_PROGRESS_KEY);
}

/** Read the on-device tutor memory (parsed; {} when absent/corrupt). */
export async function readTutorMemory(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }, TUTOR_MEMORY_KEY);
}

/** Read the offline-pack completion marker (parsed; null when absent). */
export async function readPackMarker(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }, TUTOR_PACK_MARKER_KEY);
}

/**
 * Build a fully-correct StubEars queue for one lesson from the app's own
 * derived content (single source of truth: /src/lib/tutor-content.ts served
 * by the dev server). `overrides` replaces the queue items for a given
 * lesson-item index (e.g. wrong answers for the first item).
 */
export async function scriptLessonQueue(
  page: Page,
  lesson: number,
  overrides: Record<number, StubQueueItem[]> = {},
): Promise<{ ids: string[]; texts: string[] }> {
  return page.evaluate(
    ({ lesson, key, overrides }) => {
      const overrideMap = new Map(Object.entries(overrides));
      return import("/src/lib/tutor-content.ts").then((content) => {
        const items = content.itemsForLesson(lesson);
        const queue: unknown[] = items.flatMap((item, index) => {
          const override = overrideMap.get(String(index));
          if (override) return override;
          return [{ ok: true, transcript: item.text, alternatives: [] }];
        });
        window.localStorage.setItem(
          key,
          JSON.stringify({ probe: "ready", queue }),
        );
        return { ids: items.map((item) => item.id), texts: items.map((item) => item.text) };
      });
    },
    { lesson, key: TUTOR_EARS_KEY, overrides },
  );
}

export function tutorSessionUrl(lesson: number | string, code = "clase", slot = 1): string {
  return `/tutor/${lesson}?code=${encodeURIComponent(code)}&slot=${slot}`;
}

export interface MicState {
  present: boolean;
  disabled: boolean;
  capturing: boolean;
}

/** Mic button state via the landed TutorMicButton attributes. */
export async function micState(page: Page): Promise<MicState> {
  return page.evaluate(() => {
    const button = document.querySelector('[data-tutor-mic]');
    if (!button) return { present: false, disabled: false, capturing: false };
    return {
      present: true,
      disabled:
        (button as HTMLButtonElement).disabled || button.getAttribute("aria-disabled") === "true",
      capturing: button.getAttribute("data-capturing") === "true",
    };
  });
}

/** LISTEN phase with the mic idle: present, enabled, not capturing. */
export async function micReadyToListen(page: Page): Promise<boolean> {
  const state = await micState(page);
  return state.present && !state.disabled && !state.capturing;
}

/**
 * The ENDED/celebrate screen of a finished session. Selector candidates are
 * the W6 session screen's data attributes; adapt here if the landed runtime
 * names them differently.
 */
const ENDED_SELECTORS = [
  '[data-tutor-ended]',
  '[data-tutor-stage][data-phase="ENDED"]',
  '[data-tutor-celebrate]',
];

export async function sessionEnded(page: Page): Promise<boolean> {
  for (const selector of ENDED_SELECTORS) {
    if ((await page.locator(selector).count()) > 0) return true;
  }
  return false;
}

export async function expectSessionEnded(page: Page): Promise<void> {
  await expect
    .poll(async () => sessionEnded(page), { timeout: 120_000 })
    .toBe(true);
}

/** Wait for the LISTEN phase (mic back, idle) and tap it once. */
export async function tapMicWhenReady(page: Page, timeout = 120_000): Promise<void> {
  await expect.poll(async () => micReadyToListen(page), { timeout }).toBe(true);
  await page.locator('[data-tutor-mic]').click();
}

/**
 * Drive a scripted session to its ENDED screen, one mic tap per listen
 * window. The wait before each tap also accepts the ENDED state, so the
 * final tap's praise → celebrate → ENDED sequence never dead-ends the
 * loop. `maxTaps` guards against a stuck loop.
 */
export async function driveSessionToCompletion(page: Page, maxTaps: number): Promise<number> {
  let taps = 0;
  while (!(await sessionEnded(page))) {
    await expect
      .poll(async () => (await sessionEnded(page)) || (await micReadyToListen(page)), {
        timeout: 120_000,
      })
      .toBe(true);
    if (await sessionEnded(page)) break;
    await page.locator("[data-tutor-mic]").click();
    taps += 1;
    if (taps > maxTaps) {
      throw new Error(`Session did not end after ${maxTaps} mic taps`);
    }
  }
  return taps;
}

/**
 * Assert every collected request stayed on the dev server (privacy §): any
 * scheme is fine (http + the dev server's own HMR websocket), but the host
 * must be the dev server's — nothing may leave the machine.
 */
export function expectSameOriginOnly(urls: string[], origin: string): void {
  const originHost = new URL(origin).host;
  const foreign = urls.filter((url) => {
    try {
      return new URL(url).host !== originHost;
    } catch {
      return true;
    }
  });
  expect(
    foreign,
    "Every network request must be same-origin (on-device only, no cloud STT)",
  ).toEqual([]);
}