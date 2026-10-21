/**
 * StubEars — scripted ears for unit tests and e2e runs (spec §2, §4).
 *
 * Never touches a microphone, a Web Worker, or the network. The queue is
 * consumed in order, one item per `listen()` call; when it runs dry, every
 * further attempt reports "no-speech" (the gentle silence path).
 */

import type { EarsListenOptions, EarsListenOutcome, EarsStatus, TutorEars } from "./tutor-ears";

export type StubEarsItem = EarsListenOutcome;

export class StubEars implements TutorEars {
  readonly kind = "stub" as const;
  readonly status: EarsStatus = "ready";
  /** Every `listen()` call, in order — for test/e2e assertions. */
  readonly listenCalls: EarsListenOptions[] = [];
  private readonly queue: StubEarsItem[];

  constructor(items: readonly StubEarsItem[] = []) {
    this.queue = [...items];
  }

  probe(): Promise<"ready"> {
    return Promise.resolve("ready" as const);
  }

  listen(opts: EarsListenOptions): Promise<EarsListenOutcome> {
    this.listenCalls.push(opts);
    const next = this.queue.shift();
    return Promise.resolve(next ?? { ok: false, problem: "no-speech" });
  }

  cancel(): void {
    // Nothing is ever open in the stub; a scripted result already returned
    // stays with its caller, mirroring the real engines' settle semantics.
  }
}
