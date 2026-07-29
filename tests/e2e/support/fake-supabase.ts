import type { Page, Route } from "@playwright/test";

// A tiny stand-in for the Supabase backend, used only by the student-lane E2E
// specs.
//
// Why this exists: the student lane (join a class, read assignments, save
// progress) has no demo/seed branch — src/lib/student.functions.ts always
// calls the real Supabase RPCs. The repo's .env points at the live project,
// which holds real children's records, and AGENTS.md forbids touching a live
// service. Docker isn't available here either, so `supabase start` is not an
// option. Intercepting at the network layer lets the specs drive the REAL
// production code path (the same routes, components, zod schemas and RPC
// payloads a child hits) while the database itself is a fixture.
//
// It fakes six RPCs and nothing else — the student lane uses no table reads.
// It is deliberately not a general PostgREST fake; the teacher lane's table
// queries are covered by the demo/seed lane instead.

export type FakeStudent = { id: string; name: string; code: string };

export type FakeClassSetup = {
  joinCode: string;
  classId: string;
  className: string;
  students: FakeStudent[];
  /** Lessons the teacher has assigned to this class. */
  assignments?: Array<{
    id: string;
    lessonId: string;
    title: string | null;
    dueAt?: string | null;
    timeLimitSeconds?: number | null;
  }>;
};

type ProgressEvent = {
  id: string;
  student_id: string;
  lesson_id: string;
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export type FakeSupabase = {
  /** Every RPC the app called, in order — lets a spec prove a save happened. */
  calls: Array<{ fn: string; body: Record<string, unknown> }>;
  /** Progress rows the app has written, as the backend would hold them. */
  events: ProgressEvent[];
  /** Last page saved per `${studentId}:${lessonId}`. */
  lastPages: Map<string, number>;
  callsTo(fn: string): Array<Record<string, unknown>>;
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify(body),
  });
}

/**
 * Installs the fake on a page. Must be called before the first `page.goto`
 * so no request escapes uninterrupted.
 */
export async function installFakeSupabase(
  page: Page,
  setup: FakeClassSetup,
): Promise<FakeSupabase> {
  const fake: FakeSupabase = {
    calls: [],
    events: [],
    lastPages: new Map(),
    callsTo(fn) {
      return this.calls.filter((c) => c.fn === fn).map((c) => c.body);
    },
  };

  // Safety net, independent of environment configuration: if anything ever
  // aims at a real Supabase host, fail the request loudly rather than let a
  // test reach production data. playwright.config.ts also points the app at a
  // dead local URL; this is the belt to that pair of braces.
  await page.route(/https?:\/\/[^/]*supabase\.(co|in)\//, (route) => {
    throw new Error(
      `E2E attempted to reach a real Supabase host: ${route.request().url()}. ` +
        `The student specs must stay on the fake backend.`,
    );
  });

  // supabase-js calls signOut() during the join flow; answer auth locally.
  await page.route("**/auth/v1/**", (route) => json(route, {}));

  await page.route("**/rest/v1/rpc/*", async (route) => {
    const request = route.request();
    const fn = new URL(request.url()).pathname.split("/").pop() ?? "";
    let body: Record<string, unknown> = {};
    try {
      body = (request.postDataJSON() ?? {}) as Record<string, unknown>;
    } catch {
      body = {};
    }
    fake.calls.push({ fn, body });

    const codeMatches = (given: unknown) =>
      String(given ?? "").toUpperCase() === setup.joinCode.toUpperCase();

    switch (fn) {
      // Step 1 of join: join code alone returns the "tap your name" roster.
      case "list_class_students": {
        if (!codeMatches(body.p_join_code)) return json(route, []);
        return json(
          route,
          setup.students.map((s) => ({ student_id: s.id, display_name: s.name })),
        );
      }

      // Step 2 of join: the child taps their name and enters the class.
      // Called through .single(), so PostgREST returns a bare object.
      case "enter_class_as_student": {
        const student = setup.students.find((s) => s.id === body.p_student_id);
        if (!codeMatches(body.p_join_code) || !student) {
          return json(route, { message: "Código de clase o estudiante inválido." }, 400);
        }
        return json(route, {
          student_id: student.id,
          student_name: student.name,
          student_code: student.code,
          class_id: setup.classId,
          class_name: setup.className,
        });
      }

      // What the teacher assigned — drives the "Tarea asignada" banner.
      case "get_student_assignments": {
        return json(
          route,
          (setup.assignments ?? []).map((a) => ({
            id: a.id,
            class_id: setup.classId,
            lesson_id: a.lessonId,
            title: a.title,
            due_at: a.dueAt ?? null,
            time_limit_seconds: a.timeLimitSeconds ?? null,
            created_at: new Date().toISOString(),
          })),
        );
      }

      // The child's saved progress. Shaped exactly as the real RPC returns it:
      // an `events` list plus a derived `lessonProgress` roll-up carrying the
      // resume page, which is what /cartilla/lecciones rehydrates from.
      case "get_student_progress": {
        const mine = fake.events.filter((e) => e.student_id === body.p_student_id);
        const lessonIds = Array.from(new Set(mine.map((e) => e.lesson_id)));
        return json(route, {
          student: { display_name: "", student_code: String(body.p_student_code ?? "") },
          events: mine,
          lessonProgress: lessonIds.map((lesson_id) => ({
            lesson_id,
            status: mine.some(
              (e) => e.lesson_id === lesson_id && e.event_kind === "lesson_completed",
            )
              ? "completed"
              : "started",
            last_page: fake.lastPages.get(`${String(body.p_student_id)}:${lesson_id}`) ?? null,
          })),
        });
      }

      // A save. Recorded so the next get_student_progress returns it, which is
      // how "progress survives a reload" is proven rather than assumed.
      case "log_student_progress": {
        fake.events.unshift({
          id: `evt-${fake.events.length + 1}`,
          student_id: String(body.p_student_id ?? ""),
          lesson_id: String(body.p_lesson_id ?? ""),
          event_kind: String(body.p_event_kind ?? ""),
          score: (body.p_score as number | null) ?? null,
          total: (body.p_total as number | null) ?? null,
          time_seconds: (body.p_time_seconds as number | null) ?? null,
          meta: (body.p_meta as Record<string, unknown> | null) ?? null,
          created_at: new Date().toISOString(),
        });
        return json(route, null);
      }

      case "save_last_page": {
        fake.lastPages.set(
          `${String(body.p_student_id)}:${String(body.p_lesson_id)}`,
          Number(body.p_page ?? 0),
        );
        return json(route, null);
      }

      default:
        // Anything unfaked is a real gap — surface it instead of silently
        // returning empty and letting a spec pass for the wrong reason.
        return json(route, { message: `Unfaked RPC: ${fn}` }, 500);
    }
  });

  return fake;
}
