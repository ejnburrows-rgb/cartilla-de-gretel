import { afterEach, describe, expect, it, vi } from "vitest";
import {
  executeTutorTool,
  findVerifiedFlipchartRegion,
  LIVE_TUTOR_GAMES,
  resolveActiveFlipchartCues,
  resolveVerifiedFlipchartRegions,
  TUTOR_TOOL_NAMES,
  type FlipchartChoreographyCue,
  type TutorToolContext,
  type TutorToolHost,
} from "@/lib/tutor-tools";
import { getPlayableEntries, LEGACY_PENDING_ENTRIES } from "@/lib/tutor-dialogue-manifest";
import { appendTutorProgress, clearTutorProgress } from "@/lib/tutor-progress";
import { getFlipchartImportantRects } from "@/components/tutor/TutorFlipchartPresenter";

function makeContext(overrides: Partial<TutorToolContext> = {}): TutorToolContext {
  return {
    role: "student",
    sessionId: "student-session-001",
    lesson: 2,
    phase: "ready",
    layout: "call",
    workbookPage: 4,
    flipchartSheet: 4,
    activeItemId: "l2-word-oso",
    activeGameId: null,
    lastSpokenLineId: null,
    highlightedRegionId: null,
    ...overrides,
  };
}

describe("tutor-tools (Milestone 7)", () => {
  afterEach(() => {
    clearTutorProgress();
  });

  it("exposes the exact 17 allowlisted canonical commands", () => {
    expect(TUTOR_TOOL_NAMES).toEqual([
      "getLearningContext",
      "getVerifiedCurriculum",
      "openLesson",
      "openWorkbookPage",
      "openFlipchartSheet",
      "highlightRegion",
      "showIllustration",
      "demonstrateLetter",
      "launchGame",
      "playApprovedRecording",
      "giveHint",
      "checkSupportedAnswer",
      "getAuthorizedProgress",
      "resume",
      "repeat",
      "changeLayout",
      "completeSession",
    ]);
  });

  describe("role, allowlist, and input safety guards", () => {
    it("rejects non-student roles (teacher, admin, system, missing)", () => {
      for (const badRole of ["teacher", "admin", "teacher-admin", "system", "", null, undefined]) {
        const res = executeTutorTool(
          { command: "getLearningContext" },
          makeContext({ role: badRole }),
        );
        expect(res.status).toBe("error");
        if (res.status === "error") {
          expect(res.code).toBe("forbidden-role");
        }
      }
    });

    it("rejects disallowed commands (arbitrary JS, DB, admin, URL actions)", () => {
      for (const badCmd of ["eval", "runScript", "openUrl", "queryDatabase", "deleteStudent", "teacherOverride"]) {
        const res = executeTutorTool({ command: badCmd, args: {} }, makeContext());
        expect(res.status).toBe("error");
        if (res.status === "error") {
          expect(res.code).toBe("disallowed-command");
        }
      }
    });

    it("rejects URLs, JS schemes, path traversal, SQL injection, and prototype keys", () => {
      const unsafePayloads = [
        { command: "showIllustration", args: { word: "https://evil.example/a.png" } },
        { command: "launchGame", args: { gameId: "javascript:alert(1)" } },
        { command: "playApprovedRecording", args: { lineId: "../../etc/passwd" } },
        { command: "checkSupportedAnswer", args: { response: "SELECT * FROM users; --" } },
        { command: "demonstrateLetter", args: { letter: "<script>alert(1)</script>" } },
      ];

      for (const payload of unsafePayloads) {
        const res = executeTutorTool(payload, makeContext());
        expect(res.status).toBe("error");
        if (res.status === "error") {
          expect(res.code).toBe("unsafe-argument");
        }
      }

      const protoPayload = JSON.parse('{"command":"openLesson","args":{"lesson":2,"__proto__":{"polluted":true}}}');
      const protoRes = executeTutorTool(protoPayload, makeContext());
      expect(protoRes.status).toBe("error");
      if (protoRes.status === "error") {
        expect(protoRes.code).toBe("unsafe-argument");
      }
    });

    it("blocks interactive commands when session phase is ended, while allowing resume", () => {
      const endedCtx = makeContext({ phase: "ended" });
      const blocked = executeTutorTool({ command: "openLesson", args: { lesson: 3 } }, endedCtx);
      expect(blocked.status).toBe("error");
      if (blocked.status === "error") {
        expect(blocked.code).toBe("invalid-state");
      }

      const onResume = vi.fn();
      const resumed = executeTutorTool({ command: "resume" }, endedCtx, { onResume });
      expect(resumed.status).toBe("ok");
      expect(onResume).toHaveBeenCalledTimes(1);
    });
  });

  describe("curriculum, workbook, flipchart, and game commands", () => {
    it("getLearningContext and getVerifiedCurriculum return verified data", () => {
      const ctxRes = executeTutorTool({ command: "getLearningContext" }, makeContext());
      expect(ctxRes.status).toBe("ok");
      if (ctxRes.status === "ok") {
        expect(ctxRes.data.lesson).toBe(2);
        expect(ctxRes.data.activeItemId).toBe("l2-word-oso");
      }

      const currRes = executeTutorTool(
        { command: "getVerifiedCurriculum", args: { lesson: 7 } },
        makeContext(),
      );
      expect(currRes.status).toBe("ok");
      if (currRes.status === "ok") {
        expect(currRes.data.lesson).toBe(7);
      }

      const badLesson = executeTutorTool(
        { command: "getVerifiedCurriculum", args: { lesson: 99 } },
        makeContext(),
      );
      expect(badLesson.status).toBe("error");
    });

    it("openLesson and openFlipchartSheet invoke host callbacks with canonical IDs", () => {
      const host: TutorToolHost = {
        onOpenLesson: vi.fn(),
        onOpenFlipchartSheet: vi.fn(),
      };

      const lessonRes = executeTutorTool({ command: "openLesson", args: { lesson: 3 } }, makeContext(), host);
      expect(lessonRes.status).toBe("ok");
      expect(host.onOpenLesson).toHaveBeenCalledWith(3);

      const sheetRes = executeTutorTool(
        { command: "openFlipchartSheet", args: { sheetNumber: 4 } },
        makeContext(),
        host,
      );
      expect(sheetRes.status).toBe("ok");
      expect(host.onOpenFlipchartSheet).toHaveBeenCalledWith(4, 2);

      const badSheet = executeTutorTool(
        { command: "openFlipchartSheet", args: { sheetNumber: 999 } },
        makeContext(),
      );
      expect(badSheet.status).toBe("error");
    });

    it("openWorkbookPage separates printed pages from PDF sheets and marks 86–87 absent-in-source", () => {
      const onOpenWorkbookPage = vi.fn();
      const p4 = executeTutorTool(
        { command: "openWorkbookPage", args: { printedPage: 4 } },
        makeContext(),
        { onOpenWorkbookPage },
      );
      expect(p4.status).toBe("ok");
      if (p4.status === "ok") {
        expect(p4.data.printedPage).toBe(4);
        expect(p4.data.pdfSheet).toBe(10);
        expect(p4.data.lesson).toBe(2);
      }
      expect(onOpenWorkbookPage).toHaveBeenCalledWith(4, 2);

      for (const absentPage of [86, 87]) {
        const res = executeTutorTool(
          { command: "openWorkbookPage", args: { printedPage: absentPage } },
          makeContext(),
        );
        expect(res.status).toBe("unavailable");
        if (res.status === "unavailable") {
          expect(res.code).toBe("absent-in-source");
        }
      }
    });

    it("highlightRegion, showIllustration, and demonstrateLetter resolve verified flipchart geometry", () => {
      const host: TutorToolHost = {
        onHighlightRegion: vi.fn(),
        onShowIllustration: vi.fn(),
        onDemonstrateLetter: vi.fn(),
      };

      const hl = executeTutorTool(
        {
          command: "highlightRegion",
          args: { sheetNumber: 4, word: "oso", cueTiming: "before" },
        },
        makeContext(),
        host,
      );
      expect(hl.status).toBe("ok");
      expect(host.onHighlightRegion).toHaveBeenCalledTimes(1);

      const illus = executeTutorTool(
        { command: "showIllustration", args: { word: "oveja", sheetNumber: 4, cueTiming: "atStart" } },
        makeContext(),
        host,
      );
      expect(illus.status).toBe("ok");
      expect(host.onShowIllustration).toHaveBeenCalledTimes(1);

      const demo = executeTutorTool(
        { command: "demonstrateLetter", args: { letter: "o" } },
        makeContext(),
        host,
      );
      expect(demo.status).toBe("ok");
      if (demo.status === "ok") {
        expect(demo.data.lesson).toBe(2);
        expect(demo.data.flipchartSheet).toBe(4);
      }
      expect(host.onDemonstrateLetter).toHaveBeenCalledTimes(1);
    });

    it("launchGame accepts only canonical live games", () => {
      const onLaunchGame = vi.fn();
      const firstGame = LIVE_TUTOR_GAMES[0]!;
      const okRes = executeTutorTool(
        { command: "launchGame", args: { gameId: firstGame.id } },
        makeContext(),
        { onLaunchGame },
      );
      expect(okRes.status).toBe("ok");
      expect(onLaunchGame).toHaveBeenCalledWith(firstGame, 2);

      const missing = executeTutorTool(
        { command: "launchGame", args: { gameId: "nonexistent-game" } },
        makeContext(),
      );
      expect(missing.status).toBe("error");
    });
  });

  describe("audio, hints, answer checking, progress isolation, and lifecycle", () => {
    it("playApprovedRecording allows approved recordings and marks scripted/pending unavailable", () => {
      const playable = getPlayableEntries()[0]!;
      const onPlayApprovedRecording = vi.fn();
      const okRes = executeTutorTool(
        { command: "playApprovedRecording", args: { lineId: playable.id } },
        makeContext(),
        { onPlayApprovedRecording },
      );
      expect(okRes.status).toBe("ok");
      expect(onPlayApprovedRecording).toHaveBeenCalledTimes(1);

      const pending = LEGACY_PENDING_ENTRIES[0]!;
      const pendingRes = executeTutorTool(
        { command: "playApprovedRecording", args: { lineId: pending.id } },
        makeContext(),
      );
      expect(pendingRes.status).toBe("unavailable");
      if (pendingRes.status === "unavailable") {
        expect(pendingRes.code).toBe("audio-not-approved");
      }
    });

    it("giveHint and checkSupportedAnswer validate against canonical items and pending answer keys", () => {
      const hintRes = executeTutorTool(
        { command: "giveHint", args: { itemId: "l2-word-oso", level: 1 } },
        makeContext(),
      );
      expect(hintRes.status).toBe("ok");
      if (hintRes.status === "ok") {
        expect(hintRes.data.itemId).toBe("l2-word-oso");
      }

      const passRes = executeTutorTool(
        { command: "checkSupportedAnswer", args: { itemId: "l2-word-oso", response: "oso" } },
        makeContext(),
      );
      expect(passRes.status).toBe("ok");
      if (passRes.status === "ok") {
        expect(passRes.data.pass).toBe(true);
      }

      const distractorRes = executeTutorTool(
        { command: "checkSupportedAnswer", args: { itemId: "l2-word-oveja", response: "oreja" } },
        makeContext(),
      );
      expect(distractorRes.status).toBe("ok");
      if (distractorRes.status === "ok") {
        expect(distractorRes.data.pass).toBe(false);
      }

      const pendingKeyRes = executeTutorTool(
        {
          command: "checkSupportedAnswer",
          args: { gameId: "completar-palabras", response: "ma" },
        },
        makeContext({ lesson: 7 }),
      );
      expect(pendingKeyRes.status).toBe("unavailable");
      if (pendingKeyRes.status === "unavailable") {
        expect(pendingKeyRes.code).toBe("answer-key-pending");
      }
    });

    it("getAuthorizedProgress isolates progress strictly to the active student sessionId", () => {
      appendTutorProgress({
        session_id: "student-session-001",
        lesson_id: 2,
        item_id: "l2-word-oso",
        result: "correct",
        attempts: 1,
      });
      appendTutorProgress({
        session_id: "other-student-999",
        lesson_id: 2,
        item_id: "l2-word-ola",
        result: "missed",
        attempts: 3,
      });

      const res = executeTutorTool({ command: "getAuthorizedProgress" }, makeContext());
      expect(res.status).toBe("ok");
      if (res.status === "ok") {
        expect(res.data.totalEvents).toBe(1);
        expect(res.data.correctCount).toBe(1);
        expect(res.data.missedCount).toBe(0);
      }
    });

    it("repeat, changeLayout, and completeSession invoke host callbacks cleanly", () => {
      const playable = getPlayableEntries()[0]!;
      const host: TutorToolHost = {
        onRepeat: vi.fn(),
        onChangeLayout: vi.fn(),
        onCompleteSession: vi.fn(),
      };

      const noRepeat = executeTutorTool({ command: "repeat" }, makeContext({ lastSpokenLineId: null }));
      expect(noRepeat.status).toBe("unavailable");

      const repeatRes = executeTutorTool(
        { command: "repeat" },
        makeContext({ lastSpokenLineId: playable.id }),
        host,
      );
      expect(repeatRes.status).toBe("ok");
      expect(host.onRepeat).toHaveBeenCalledWith(playable.id);

      const layoutRes = executeTutorTool(
        { command: "changeLayout", args: { layout: "flipchart-pip" } },
        makeContext(),
        host,
      );
      expect(layoutRes.status).toBe("ok");
      expect(host.onChangeLayout).toHaveBeenCalledWith("flipchart-pip");

      const completeRes = executeTutorTool(
        { command: "completeSession", args: { reason: "completed" } },
        makeContext(),
        host,
      );
      expect(completeRes.status).toBe("ok");
      expect(host.onCompleteSession).toHaveBeenCalledWith({
        sessionId: "student-session-001",
        lesson: 2,
        reason: "completed",
      });
    });
  });

  describe("verified Flip Chart regions & cue timing scheduler", () => {
    it("resolves verified art placement and content bounds for sheet 4", () => {
      const regions = resolveVerifiedFlipchartRegions(4);
      expect(regions.length).toBeGreaterThan(5);
      const oso = findVerifiedFlipchartRegion(4, { word: "oso" });
      expect(oso).not.toBeNull();
      expect(oso!.contentBoundsVerified).toBe(true);
      expect(oso!.xPct).toBeGreaterThanOrEqual(0);
      expect(oso!.wPct).toBeGreaterThan(0);

      const important = getFlipchartImportantRects(4, [oso!.regionId]);
      expect(important).toHaveLength(1);
      expect(important[0]!.regionId).toBe(oso!.regionId);
    });

    it("schedules before, atStart, and atWord cues strictly on real playback boundaries", () => {
      const cues: FlipchartChoreographyCue[] = [
        { cueId: "c-before", sheetNumber: 4, regionId: "sheet-4:art:oso", cueTiming: "before", lineId: "l2-oso" },
        { cueId: "c-start", sheetNumber: 4, regionId: "sheet-4:art:oveja", cueTiming: "atStart", lineId: "l2-oso" },
        {
          cueId: "c-word",
          sheetNumber: 4,
          regionId: "sheet-4:art:olla",
          cueTiming: "atWord",
          lineId: "l2-oso",
          atSeconds: 1.2,
          endSeconds: 2.5,
        },
      ];

      // Before speech starts: only "before" is active
      const pre = resolveActiveFlipchartCues(cues, { isPlaying: false, currentTime: 0, lineId: null });
      expect(pre.map((c) => c.cueId)).toEqual(["c-before"]);

      // Right at speech start (t = 0.1s): "before" and "atStart" are active; "atWord" not yet
      const start = resolveActiveFlipchartCues(cues, { isPlaying: true, currentTime: 0.1, lineId: "l2-oso" });
      expect(start.map((c) => c.cueId)).toEqual(["c-before", "c-start"]);

      // At word boundary (t = 1.5s): all three active
      const mid = resolveActiveFlipchartCues(cues, { isPlaying: true, currentTime: 1.5, lineId: "l2-oso" });
      expect(mid.map((c) => c.cueId)).toEqual(["c-before", "c-start", "c-word"]);

      // After endSeconds (t = 3.0s): "atWord" expires
      const after = resolveActiveFlipchartCues(cues, { isPlaying: true, currentTime: 3.0, lineId: "l2-oso" });
      expect(after.map((c) => c.cueId)).toEqual(["c-before", "c-start"]);
    });
  });
});
