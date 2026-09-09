/**
 * @vitest-environment jsdom
 */
// Public access starts a local classroom; disabling it retains the cloud gate.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isRedirect } from "@tanstack/react-router";

const getSession = vi.fn();
const getUser = vi.fn();
const rpc = vi.fn();
const startTeacherReview = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      getUser: (...args: unknown[]) => getUser(...args),
    },
    rpc: (...args: unknown[]) => rpc(...args),
  },
}));

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => null,
}));

vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: () => false,
  startTeacherReview: () => startTeacherReview(),
}));

async function loadRoute() {
  const mod = await import("../route");
  return mod.Route;
}

describe("teacher lane root beforeLoad — real auth gate", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_CRM_REVIEW", "false");
    startTeacherReview.mockReset();
    getSession.mockReset();
    getUser.mockReset();
    rpc.mockReset();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("opens the teacher classroom without any cloud login in public mode", async () => {
    vi.stubEnv("VITE_CRM_REVIEW", "true");
    const Route = await loadRoute();
    await Route.options.beforeLoad!({} as never);
    expect(startTeacherReview).toHaveBeenCalledOnce();
    expect(getSession).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no real Supabase session (anonymous visitor)", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    const Route = await loadRoute();

    let caught: unknown;
    try {
      await Route.options.beforeLoad!({} as never);
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeDefined();
    expect(isRedirect(caught)).toBe(true);
    expect((caught as { options: { to: string } }).options.to).toBe("/login");
  });

  it("does NOT redirect to /login when a real teacher session exists", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "teacher-1" } } },
    });
    rpc.mockResolvedValue({ data: true, error: null });
    const Route = await loadRoute();

    let caught: unknown;
    try {
      await Route.options.beforeLoad!({} as never);
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeUndefined();
  });

  it("redirects to /login when a session exists but the user holds no teacher/admin role", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "roleless-1" } } },
    });
    rpc.mockResolvedValue({ data: false, error: null });
    const Route = await loadRoute();

    let caught: unknown;
    try {
      await Route.options.beforeLoad!({} as never);
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeDefined();
    expect(isRedirect(caught)).toBe(true);
    expect((caught as { options: { to: string } }).options.to).toBe("/login");
  });
});
