/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRedirect } from "@tanstack/react-router";

const getStudentSessionMock = vi.fn();
const setStudentSessionMock = vi.fn();

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => getStudentSessionMock(),
  setStudentSession: (s: any) => setStudentSessionMock(s),
  useStudentSession: () => getStudentSessionMock(),
}));

const signOutMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signOut: (...args: any[]) => signOutMock(...args),
    },
  },
}));

describe("Student-Teacher Routing Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentSessionMock.mockReturnValue(null);
  });

  describe("presentar.$n.tsx route guard", () => {
    it("blocks student session from teacher presentation route", async () => {
      getStudentSessionMock.mockReturnValue({ studentId: "s1" });
      const mod = await import("../cartilla/presentar.$n");
      const Route = mod.Route;

      let caught: any;
      try {
        await Route.options.beforeLoad!({ params: { n: "1" } } as any);
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeDefined();
      expect(isRedirect(caught)).toBe(true);
      expect(caught.options.to).toBe("/cartilla/lecciones");
    });
  });
});
