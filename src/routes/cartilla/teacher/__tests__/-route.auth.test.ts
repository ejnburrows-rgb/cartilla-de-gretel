/**
 * @vitest-environment jsdom
 */
// Regression test: the whole /cartilla/teacher/* lane must require a real
// teacher (Supabase) session — not just "isn't a logged-in student". Every
// route under this parent nests via <Outlet/>, so this one beforeLoad is
// the single real gate for the entire teacher lane. Locks in the fix for a
// real gap found in production: an anonymous visitor could load the
// teacher nav shell (Roster/Progress/Reports/Guía/Present) without ever
// being asked to log in.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRedirect } from "@tanstack/react-router";

const getSession = vi.fn();
const getUser = vi.fn();
const rpc = vi.fn();

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

async function loadRoute() {
  const mod = await import("../route");
  return mod.Route;
}

describe("teacher lane root beforeLoad — real auth gate", () => {
  beforeEach(() => {
    vi.resetModules();
    getSession.mockReset();
    getUser.mockReset();
    rpc.mockReset();
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
    getSession.mockResolvedValue({ data: { session: { user: { id: "teacher-1" } } } });
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
    getSession.mockResolvedValue({ data: { session: { user: { id: "roleless-1" } } } });
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
