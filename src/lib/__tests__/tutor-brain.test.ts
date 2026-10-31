/**
 * Tutor brain tests (GRETEL-TUTOR-BUILD-SPEC §5, §18.6).
 *
 * Every row of the §5 state machine table, plus idle timeout, exit,
 * mic-before-tap behavior, praise variety, the review round, and the
 * grammar composition for ears.listen() (lesson items ∪ same-page
 * distractors ∪ vowels + aliases ∪ commands ∪ "[unk]").
 */
import { describe, expect, it } from "vitest";
import { findTutorItem, itemsForLesson } from "../tutor-content";
import {
  IDLE_TIMEOUT_MS,
  SPANISH_CARRIER_WORDS,
  buildListenGrammar,
  createBrainState,
  currentTargetItem,
  reduce,
  type BrainEvent,
  type BrainState,
  type CreateBrainStateOptions,
  type Effect,
} from "../tutor-brain";
import { COMMAND_PHRASES } from "../tutor-intent";
import { VOWELS, VOWEL_ALIASES } from "../tutor-intent";

const rng0 = () => 0;

function brain(lesson: number, opts: Partial<CreateBrainStateOptions> = {}): BrainState {
  return createBrainState({ lesson, sessionId: "test-session", ...opts });
}

interface Drive {
  state: BrainState;
  effects: Effect[];
}

function drive(initial: BrainState, events: BrainEvent[], rng: () => number = rng0): Drive {
  let state = initial;
  const effects: Effect[] = [];
  for (const ev of events) {
    const step = reduce(state, ev, rng);
    state = step.state;
    effects.push(...step.effects);
  }
  return { state, effects };
}

/** START → GREET → MODEL → LISTEN, ready for a mic tap. */
function toListen(lesson: number, opts: Partial<CreateBrainStateOptions> = {}): BrainState {
  return drive(brain(lesson, opts), [
    { type: "START" },
    { type: "LINE_DONE" },
    { type: "LINE_DONE" },
  ]).state;
}

function tapAndHear(
  state: BrainState,
  transcript: string,
  alternatives: string[] = [],
  rng: () => number = rng0,
): Drive {
  return drive(state, [{ type: "MIC_TAP" }, { type: "HEARD", transcript, alternatives }], rng);
}

function lineIds(effects: Effect[]): string[] {
  return effects
    .filter((e): e is Extract<Effect, { type: "playLine" }> => e.type === "playLine")
    .map((e) => e.lineId);
}

describe("START → GREET (greeting rotating 1 of 3)", () => {
  it("plays a lesson greeting line and enters GREET", () => {
    const { state, effects } = drive(brain(1), [{ type: "START" }]);
    expect(state.phase).toBe("GREET");
    expect(state.started).toBe(true);
    expect(lineIds(effects)).toEqual(["l1-greeting-first-01"]);
  });

  it("rotates through the 3 greeting lines as the rng moves", () => {
    const first = reduce(brain(1), { type: "START" }, () => 0.01);
    const second = reduce(brain(1), { type: "START" }, () => 0.5);
    const third = reduce(brain(1), { type: "START" }, () => 0.99);
    expect(lineIds(first.effects)[0]).toBe("l1-greeting-first-01");
    expect(lineIds(second.effects)[0]).toBe("l1-greeting-first-02");
    expect(lineIds(third.effects)[0]).toBe("l1-greeting-first-03");
  });

  it("a returning child hears the greeting-return line", () => {
    const { effects } = drive(brain(1, { returning: true }), [{ type: "START" }]);
    expect(lineIds(effects)).toEqual(["l0-greeting-return-01"]);
  });

  it("ignores every other event before START", () => {
    const initial = brain(1);
    for (const ev of [
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "oso", alternatives: [] },
      { type: "IDLE_TIMEOUT" },
    ] as BrainEvent[]) {
      const step = reduce(initial, ev, rng0);
      expect(step.state).toBe(initial);
      expect(step.effects).toEqual([]);
    }
  });
});

describe("GREET LINE_DONE → MODEL", () => {
  it("highlights the first item and plays its model line", () => {
    const greeted = drive(brain(1), [{ type: "START" }]).state;
    const { state, effects } = drive(greeted, [{ type: "LINE_DONE" }]);
    expect(state.phase).toBe("MODEL");
    expect(effects).toEqual([
      { type: "highlight", itemId: "l1-vowel-a" },
      { type: "playLine", lineId: "l0-vowel-model-a" },
    ]);
  });
});

describe("MODEL LINE_DONE → LISTEN (mic still off)", () => {
  it("enters LISTEN without opening the mic", () => {
    const state = drive(brain(1), [{ type: "START" }, { type: "LINE_DONE" }]).state;
    const step = reduce(state, { type: "LINE_DONE" }, rng0);
    expect(step.state.phase).toBe("LISTEN");
    expect(step.state.capturing).toBe(false);
    expect(step.effects).toEqual([]);
  });
});

describe("LISTEN MIC_TAP → capturing", () => {
  it("a tap in LISTEN arms the mic", () => {
    const state = toListen(1);
    const step = reduce(state, { type: "MIC_TAP" }, rng0);
    expect(step.state.phase).toBe("LISTEN");
    expect(step.state.capturing).toBe(true);
  });

  it("mic-before-tap: a tap outside LISTEN does nothing", () => {
    for (const state of [
      brain(1),
      drive(brain(1), [{ type: "START" }]).state,
      drive(brain(1), [{ type: "START" }, { type: "LINE_DONE" }]).state,
    ]) {
      const step = reduce(state, { type: "MIC_TAP" }, rng0);
      expect(step.state).toBe(state);
      expect(step.effects).toEqual([]);
    }
  });

  it("mic-before-tap: HEARD without a tap is ignored", () => {
    const state = toListen(1);
    const step = reduce(state, { type: "HEARD", transcript: "a", alternatives: [] }, rng0);
    expect(step.state).toBe(state);
    expect(step.effects).toEqual([]);
  });

  it("a double tap does nothing the second time", () => {
    const state = toListen(1);
    const tapped = reduce(state, { type: "MIC_TAP" }, rng0).state;
    const again = reduce(tapped, { type: "MIC_TAP" }, rng0);
    expect(again.state).toBe(tapped);
  });
});

describe("LISTEN HEARD → MATCH pass → RESPOND(correct)", () => {
  it("marks correct and praises", () => {
    const { state, effects } = tapAndHear(toListen(1), "a");
    expect(state.phase).toBe("RESPOND");
    expect(state.respondKind).toBe("correct");
    expect(state.attempts).toBe(1);
    expect(state.streak).toBe(1);
    expect(effects).toEqual([
      { type: "markCorrect" },
      { type: "playLine", lineId: "l0-praise-01" },
    ]);
  });

  it("RESPOND LINE_DONE logs the final result and moves to the next item", () => {
    const after = tapAndHear(toListen(1), "a").state;
    const { state, effects } = drive(after, [{ type: "LINE_DONE" }]);
    expect(state.phase).toBe("MODEL");
    expect(state.itemIndex).toBe(1);
    expect(state.attempts).toBe(0);
    expect(effects).toEqual([
      {
        type: "logProgress",
        evt: {
          sessionId: "test-session",
          lessonId: "1",
          itemId: "l1-vowel-a",
          result: "correct",
          attempts: 1,
        },
      },
      { type: "highlight", itemId: "l1-vowel-e" },
      { type: "playLine", lineId: "l0-vowel-model-e" },
    ]);
  });

  it("fusion: an alternative that passes counts as correct", () => {
    const { state, effects } = tapAndHear(toListen(1), "mmm", ["a"]);
    expect(state.respondKind).toBe("correct");
    expect(effects[0]).toEqual({ type: "markCorrect" });
  });
});

describe("MATCH fail, attempts<3 → RESPOND(retry)", () => {
  /** Drive lesson 2 to its word item "ola" (vowel "o" passes first). */
  function toWordOla(): BrainState {
    return drive(toListen(2), [
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "oh", alternatives: [] },
      { type: "LINE_DONE" }, // log + advance → MODEL "ola"
      { type: "LINE_DONE" }, // → LISTEN on "ola"
    ]).state;
  }

  it("erases the wrong mark, plays the close-miss line, then the slow-model hint", () => {
    const state = toWordOla();
    expect(currentTargetItem(state).text).toBe("ola");
    // "olita" fails the pass threshold (≤ 1 for a 3-letter word) but sits
    // within target length + 1 → CLOSE.
    const { state: after, effects } = tapAndHear(state, "olita");
    expect(after.phase).toBe("RESPOND");
    expect(after.respondKind).toBe("retry");
    expect(after.attempts).toBe(1);
    expect(effects).toEqual([
      { type: "markWrongErase" },
      { type: "playLine", lineId: "l0-close-miss-01" },
      { type: "playLine", lineId: "l2-model-ola" },
    ]);
  });

  it("RESPOND(retry) LINE_DONE returns to LISTEN for the same item", () => {
    const retry = tapAndHear(toWordOla(), "olita").state;
    const { state, effects } = drive(retry, [{ type: "LINE_DONE" }]);
    expect(state.phase).toBe("LISTEN");
    expect(state.attempts).toBe(1); // attempt counter stays
    expect(state.itemIndex).toBe(1);
    expect(effects).toEqual([]);
  });

  it("OTHER_VOWEL: confusion line for the heard vowel, then the model", () => {
    const { state, effects } = tapAndHear(toListen(1), "e");
    expect(state.attempts).toBe(1);
    expect(lineIds(effects)).toEqual(["l0-confusion-e", "l0-vowel-model-a"]);
    expect(effects[0]).toEqual({ type: "markWrongErase" });
  });

  it("OTHER_WORD: wrong-word line, then the model", () => {
    const state = toListen(2);
    // Advance past the vowel "o" to the word "ola".
    const heard = drive(state, [
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "oh", alternatives: [] },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
    ]).state;
    expect(currentTargetItem(heard).text).toBe("ola");
    const { state: after, effects } = tapAndHear(heard, "oso");
    expect(after.attempts).toBe(1);
    expect(effects[0]).toEqual({ type: "markWrongErase" });
    expect(lineIds(effects)).toEqual(["l0-wrong-word-01", "l2-model-ola"]);
  });

  it("correct after a retry earns praise-after-retry and logs correct_after_retry", () => {
    let state = toListen(2);
    state = tapAndHear(state, "oso").state; // OTHER_WORD miss 1 on the vowel "o"
    state = drive(state, [{ type: "LINE_DONE" }]).state; // back to LISTEN
    const fixed = tapAndHear(state, "oh"); // pass on attempt 2
    expect(fixed.state.respondKind).toBe("correct");
    expect(fixed.state.attempts).toBe(2);
    expect(lineIds(fixed.effects)).toEqual(["l0-praise-after-retry-01"]);

    const done = drive(fixed.state, [{ type: "LINE_DONE" }]);
    const log = done.effects.find(
      (e): e is Extract<Effect, { type: "logProgress" }> => e.type === "logProgress",
    );
    expect(log?.evt).toEqual({
      sessionId: "test-session",
      lessonId: "2",
      itemId: "l2-vowel-o",
      result: "correct_after_retry",
      attempts: 2,
    });
  });
});

describe("MATCH fail, attempts=3 → RESPOND(missed)", () => {
  it("plays the model once more, logs missed, and advances", () => {
    let state = toListen(2);
    const effects: Effect[] = [];
    for (let miss = 0; miss < 3; miss++) {
      const heard = tapAndHear(state, "oso"); // OTHER_WORD on the vowel "o"
      effects.push(...heard.effects);
      state = heard.state;
      if (state.respondKind === "retry") {
        // After misses 1 and 2 the retry response ends and the mic waits
        // for the next tap on the same item.
        const back = drive(state, [{ type: "LINE_DONE" }]);
        effects.push(...back.effects);
        state = back.state;
        expect(state.phase).toBe("LISTEN");
      }
    }
    expect(state.phase).toBe("RESPOND");
    expect(state.respondKind).toBe("missed");
    expect(state.attempts).toBe(3);
    expect(state.itemLogged).toBe(true);
    expect(state.missedItemIds).toEqual(["l2-vowel-o"]);

    const done = drive(state, [{ type: "LINE_DONE" }]);
    effects.push(...done.effects);
    expect(done.state.phase).toBe("MODEL");
    expect(done.state.itemIndex).toBe(1);
    expect(done.state.attempts).toBe(0);
    // missed was logged exactly once, at the third fail — not again on advance
    const logs = effects.filter(
      (e): e is Extract<Effect, { type: "logProgress" }> => e.type === "logProgress",
    );
    expect(logs).toEqual([
      {
        type: "logProgress",
        evt: {
          sessionId: "test-session",
          lessonId: "2",
          itemId: "l2-vowel-o",
          result: "missed",
          attempts: 3,
        },
      },
    ]);
  });
});

describe("MATCH off-script → LISTEN with redirect, not counted", () => {
  it("long unrelated speech gets a redirect line and no attempt", () => {
    const { state, effects } = tapAndHear(toListen(1), "hola como estas hoy");
    expect(state.phase).toBe("LISTEN");
    expect(state.attempts).toBe(0);
    expect(lineIds(effects)).toEqual(["l0-redirect-01"]);
  });

  it("REPEAT re-plays the model and does not count", () => {
    const { state, effects } = tapAndHear(toListen(1), "otra vez");
    expect(state.phase).toBe("LISTEN");
    expect(state.attempts).toBe(0);
    expect(lineIds(effects)).toEqual(["l0-repeat-ack-01", "l0-vowel-model-a"]);
  });

  it("DONT_KNOW re-plays the model and does not count", () => {
    const { state, effects } = tapAndHear(toListen(1), "no sé");
    expect(state.attempts).toBe(0);
    expect(lineIds(effects)).toEqual(["l0-dont-know-01", "l0-vowel-model-a"]);
  });

  it("HELP re-plays the model and does not count", () => {
    const { state, effects } = tapAndHear(toListen(1), "ayuda");
    expect(state.attempts).toBe(0);
    expect(lineIds(effects)).toEqual(["l0-help-01", "l0-vowel-model-a"]);
  });

  it("NOISE plays the noise line and does not count", () => {
    const { state, effects } = tapAndHear(toListen(1), "[unk]");
    expect(state.phase).toBe("LISTEN");
    expect(state.attempts).toBe(0);
    expect(lineIds(effects)).toEqual(["l0-noise-01"]);
  });

  it("SILENCE nudges once, then stops the mic after two", () => {
    const first = tapAndHear(toListen(1), "");
    expect(first.state.phase).toBe("LISTEN");
    expect(first.state.silenceNudges).toBe(1);
    // The mic keeps listening after the first nudge.
    expect(first.state.capturing).toBe(true);
    expect(first.effects.some((e) => e.type === "stopMic")).toBe(false);
    expect(lineIds(first.effects)).toEqual(["l0-silence-nudge-01"]);

    // Second silent result arrives from the still-open mic — no new tap.
    const second = drive(first.state, [{ type: "HEARD", transcript: "", alternatives: [] }]);
    expect(second.state.silenceNudges).toBe(2);
    expect(second.state.capturing).toBe(false);
    expect(second.effects).toContainEqual({ type: "stopMic" });
  });
});

describe("RESPOND LINE_DONE, last item → CELEBRATE", () => {
  it("cheers with a closing line", () => {
    const single = brain(2, { items: [findTutorItem(2, "oso")] });
    const { state, effects } = drive(single, [
      { type: "START" },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "oso", alternatives: [] },
      { type: "LINE_DONE" },
    ]);
    expect(state.phase).toBe("CELEBRATE");
    expect(lineIds(effects)).toContain("l0-closing-01");
  });

  it("CELEBRATE LINE_DONE ends the session", () => {
    const single = brain(2, { items: [findTutorItem(2, "oso")] });
    const { state } = drive(single, [
      { type: "START" },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "oso", alternatives: [] },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
    ]);
    expect(state.phase).toBe("ENDED");
    expect(state.endedReason).toBe("complete");
  });

  it("a streak of 3 first-try corrects earns the streak praise line", () => {
    const items = [findTutorItem(1, "a"), findTutorItem(1, "e"), findTutorItem(1, "i")];
    const start = brain(1, { items });
    const events: BrainEvent[] = [{ type: "START" }];
    for (const item of items) {
      events.push(
        { type: "LINE_DONE" },
        { type: "LINE_DONE" },
        { type: "MIC_TAP" },
        {
          type: "HEARD",
          transcript: item.text,
          alternatives: [],
        },
        { type: "LINE_DONE" },
      );
    }
    const { state, effects } = drive(start, events);
    // Third first-try correct → streak line, and the session celebrates.
    expect(state.streak).toBe(3);
    expect(lineIds(effects)).toContain("l0-praise-streak-01");
    expect(state.phase).toBe("CELEBRATE");
  });
});

describe("review round (§18.4): one more try before celebrate", () => {
  it("missed items replay after the last item, then celebrate", () => {
    const single = brain(2, {
      items: [findTutorItem(2, "oso")],
      reviewItemIds: ["l2-word-oso"],
    });
    const missed = drive(single, [
      { type: "START" },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "osito", alternatives: [] }, // miss 1
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "osito", alternatives: [] }, // miss 2
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "osito", alternatives: [] }, // miss 3
      { type: "LINE_DONE" }, // missed logged; advance → review
    ]);
    expect(missed.state.phase).toBe("MODEL");
    expect(missed.state.inReview).toBe(true);
    expect(lineIds(missed.effects)).toContain("l0-review-intro-01");
    expect(missed.effects).toContainEqual({ type: "highlight", itemId: "l2-word-oso" });
    expect(lineIds(missed.effects)).toContain("l1-model-oso");

    const review = drive(missed.state, [
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "oso", alternatives: [] },
      { type: "LINE_DONE" },
    ]);
    expect(review.state.phase).toBe("CELEBRATE");
    const logs = review.effects.filter(
      (e): e is Extract<Effect, { type: "logProgress" }> => e.type === "logProgress",
    );
    expect(logs).toEqual([
      {
        type: "logProgress",
        evt: {
          sessionId: "test-session",
          lessonId: "2",
          itemId: "l2-word-oso",
          result: "correct",
          attempts: 1,
        },
      },
    ]);
  });
});

describe("any EARS_PROBLEM → same phase, no voice", () => {
  it("stops the mic and shows unavailable in LISTEN", () => {
    const state = toListen(1);
    const tapped = reduce(state, { type: "MIC_TAP" }, rng0).state;
    const step = reduce(tapped, { type: "EARS_PROBLEM", problem: "denied" }, rng0);
    expect(step.state.phase).toBe("LISTEN");
    expect(step.state.capturing).toBe(false);
    expect(step.effects).toEqual([
      { type: "stopMic" },
      { type: "showUnavailable", problem: "denied" },
    ]);
    // No playLine — the problem state is silent.
    expect(lineIds(step.effects)).toEqual([]);
  });

  it("keeps the current phase anywhere else too", () => {
    const greeted = drive(brain(1), [{ type: "START" }]).state;
    const step = reduce(greeted, { type: "EARS_PROBLEM", problem: "no-local" }, rng0);
    expect(step.state.phase).toBe("GREET");
    expect(step.effects).toEqual([
      { type: "stopMic" },
      { type: "showUnavailable", problem: "no-local" },
    ]);
  });
});

describe("IDLE_TIMEOUT (15 min no tap) → ENDED", () => {
  it("stops the mic and flushes the log", () => {
    const step = reduce(toListen(1), { type: "IDLE_TIMEOUT" }, rng0);
    expect(step.state.phase).toBe("ENDED");
    expect(step.state.endedReason).toBe("idle");
    expect(step.effects).toEqual([{ type: "cancelSpeech" }, { type: "stopMic" }, { type: "flushLog" }]);
  });

  it("the idle window is 15 minutes", () => {
    expect(IDLE_TIMEOUT_MS).toBe(15 * 60 * 1000);
  });
});

describe("EXIT → ENDED", () => {
  it("cancels Gretel speech and stops the mic", () => {
    const step = reduce(toListen(1), { type: "EXIT" }, rng0);
    expect(step.state.phase).toBe("ENDED");
    expect(step.state.endedReason).toBe("exit");
    expect(step.effects).toEqual([{ type: "cancelSpeech" }, { type: "stopMic" }]);
  });

  it("works mid-capture too", () => {
    const tapped = reduce(toListen(1), { type: "MIC_TAP" }, rng0).state;
    const step = reduce(tapped, { type: "EXIT" }, rng0);
    expect(step.state.phase).toBe("ENDED");
    expect(step.state.capturing).toBe(false);
  });

  it("everything after ENDED is ignored", () => {
    const ended = reduce(toListen(1), { type: "EXIT" }, rng0).state;
    for (const ev of [
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "a", alternatives: [] },
      { type: "START" },
    ] as BrainEvent[]) {
      const step = reduce(ended, ev, rng0);
      expect(step.state).toBe(ended);
      expect(step.effects).toEqual([]);
    }
  });
});

describe("praise never repeats immediately (§18.4 variety through the brain)", () => {
  it("two consecutive first-try corrects never play the same praise line", () => {
    const items = [findTutorItem(1, "a"), findTutorItem(1, "e")];
    const state = brain(1, { items });
    const { state: after, effects } = drive(state, [
      { type: "START" },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "a", alternatives: [] },
      { type: "LINE_DONE" },
      { type: "LINE_DONE" },
      { type: "MIC_TAP" },
      { type: "HEARD", transcript: "e", alternatives: [] },
    ]);
    const praise = effects.filter(
      (e): e is Extract<Effect, { type: "playLine" }> =>
        e.type === "playLine" && e.lineId.startsWith("l0-praise-"),
    );
    expect(praise).toHaveLength(2);
    expect(praise[0].lineId).not.toBe(praise[1].lineId);
    expect(after.streak).toBe(2);
  });
});

describe("buildListenGrammar (§18.2 / §18.6)", () => {
  it("contains every lesson item, the vowels + aliases, commands, and [unk]", () => {
    const grammar = buildListenGrammar(2);
    const lesson2 = itemsForLesson(2);
    for (const item of lesson2) {
      expect(grammar).toContain(item.text);
    }
    for (const vowel of VOWELS) {
      expect(grammar).toContain(vowel);
      for (const alias of VOWEL_ALIASES[vowel]) {
        expect(grammar).toContain(alias);
      }
    }
    for (const phrase of COMMAND_PHRASES) {
      expect(grammar).toContain(phrase);
    }
    expect(grammar).toContain("[unk]");
  });

  it("includes same-page distractors from the printed pages", () => {
    const grammar = buildListenGrammar(1);
    // Lesson 1 covers printed pages 1–3; every item on those pages is in the
    // grammar even though the vowel words repeat across pages.
    for (const item of itemsForLesson(1)) {
      expect(grammar).toContain(item.text);
    }
    expect(grammar).toContain("imán");
    expect(grammar).toContain("uña");
  });

  it("includes Spanish carrier words in the recognizer grammar", () => {
    const grammar = buildListenGrammar(1);
    for (const word of SPANISH_CARRIER_WORDS) {
      expect(grammar).toContain(word);
    }
    expect(grammar).toContain("el");
    expect(grammar).toContain("la");
    expect(grammar).toContain("un");
    expect(grammar).toContain("una");
    expect(grammar).toContain("es");
    expect(grammar).toContain("vocal");
    expect(grammar).toContain("letra");
    expect(grammar).toContain("dije");
  });

  it("has no duplicates and is deterministic", () => {
    const a = buildListenGrammar(3);
    const b = buildListenGrammar(3);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(a.length);
  });
});

describe("purity", () => {
  it("reduce is deterministic: same inputs, same outputs, no Math.random", () => {
    const state = toListen(1);
    const tapped = reduce(state, { type: "MIC_TAP" }, rng0).state;
    const ev: BrainEvent = { type: "HEARD", transcript: "ah", alternatives: [] };
    const a = reduce(tapped, ev, rng0);
    const b = reduce(tapped, ev, rng0);
    expect(a).toEqual(b);
    expect(a.state.attempts).toBe(1);
  });
});
