/**
 * @vitest-environment jsdom
 */
import type React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { routeTree } from "@/routeTree.gen";

// Mocks
const getStudentSessionMock = vi.fn();
const setStudentSessionMock = vi.fn();

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => getStudentSessionMock(),
  setStudentSession: (s: unknown) => setStudentSessionMock(s),
  useStudentSession: () => getStudentSessionMock(),
}));

const signOutMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  isSupabaseConfigured: false,
  supabase: {
    auth: {
      signOut: (...args: unknown[]) => signOutMock(...args),
      getSession: () => getSessionMock(),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    rpc: async () => ({ data: false, error: null }),
  },
}));

vi.mock("@/lib/seed-data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/seed-data")>();
  return {
    ...actual,
    isSeedSessionActive: () => false,
  };
});

vi.mock("@/lib/auth-role", () => ({
  hasTeacherOrAdminRole: async () => false,
}));

vi.mock("@/lib/useServerFn", () => ({
  useServerFn: () =>
    vi.fn().mockResolvedValue([{ studentId: "s1", displayName: "Student 1" }]),
}));

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({ t: (k: string) => k, language: "es" }),
  LanguageProvider: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  QueryClient: vi.fn().mockImplementation(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
  })),
  useQueryClient: () => ({}),
  useQuery: () => ({ data: [], isLoading: false }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { Route as LoginRoute } from "../login";
import { Route as UnirseRoute } from "../cartilla/unirse";
import { Route as PresentarRoute } from "../cartilla/presentar.$n";

function renderWithRouter(initialEntries: string[]) {
  const history = createMemoryHistory({ initialEntries });

  const rootRoute = createRootRouteWithContext<{ queryClient: unknown }>()({
    component: Outlet,
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: LoginRoute.options.component,
  });
  const unirseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cartilla/unirse",
    component: UnirseRoute.options.component,
  });

  const routeTree = rootRoute.addChildren([loginRoute, unirseRoute]);
  const router = createRouter({
    routeTree,
    history,
    context: { queryClient: {} },
  });
  render(<RouterProvider router={router} />);
  return { router, history };
}

describe("Student-Teacher Routing Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_CRM_REVIEW", "false");
    getStudentSessionMock.mockReturnValue(null);
    getSessionMock.mockResolvedValue({ data: { session: null } });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("(a) student login lands on /cartilla/lecciones", async () => {
    const { history } = renderWithRouter(["/cartilla/unirse"]);
    await waitFor(() =>
      expect(history.location.pathname).toBe("/cartilla/unirse"),
    );
    // Join form can lag under full-suite parallel load — wait for real markup.
    const codeInput = (await screen.findByRole(
      "textbox",
      {},
      { timeout: 10_000 },
    )) as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: "ABC123" } });

    const submitBtn = document.querySelector('button[type="submit"]');
    const form = submitBtn?.closest("form");
    if (form) {
      await fireEvent.submit(form);
    }

    const studentBtn = await screen.findByText("Student 1");
    await fireEvent.click(studentBtn);

    await waitFor(() => {
      expect(history.location.pathname).toBe("/cartilla/lecciones");
    });
  });

  describe("presentar.$n.tsx route guard", () => {
    it("opens a valid presentation without a student or teacher login in open mode", async () => {
      vi.stubEnv("VITE_CRM_REVIEW", "true");
      getStudentSessionMock.mockReturnValue({ studentId: "s1" });
      await PresentarRoute.options.beforeLoad!({ params: { n: "1" } } as never);
      expect(getSessionMock).not.toHaveBeenCalled();
    });

    it("still rejects an invalid presentation number in open mode", async () => {
      vi.stubEnv("VITE_CRM_REVIEW", "true");
      let caught: unknown;
      try {
        await PresentarRoute.options.beforeLoad!({
          params: { n: "999" },
        } as never);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeDefined();
    });

    it("(b) blocks student session from teacher presentation route", async () => {
      getStudentSessionMock.mockReturnValue({ studentId: "s1" });
      const mod = await import("../cartilla/presentar.$n");
      const Route = mod.Route;

      let caught: { options?: { to?: string }; to?: string } | undefined;
      try {
        await Route.options.beforeLoad!({
          params: { n: "1" },
          location: { href: "" },
        } as never);
      } catch (e) {
        caught = e as typeof caught;
      }

      expect(caught).toBeDefined();
      expect(caught?.options?.to).toBe("/cartilla/lecciones");
    });

    it("(b2) blocks unauthenticated visitors from teacher presentation route", async () => {
      getStudentSessionMock.mockReturnValue(null);
      getSessionMock.mockResolvedValue({ data: { session: null } });
      // Force a fresh module evaluation so beforeLoad uses current mocks.
      vi.resetModules();
      const mod = await import("../cartilla/presentar.$n");
      const Route = mod.Route;

      let caught: { options?: { to?: string }; to?: string } | undefined;
      try {
        await Route.options.beforeLoad!({
          params: { n: "1" },
          location: { href: "" },
        } as never);
      } catch (e) {
        caught = e as typeof caught;
      }

      expect(caught).toBeDefined();
      expect(caught?.options?.to ?? caught?.to).toBe("/login");
    });
  });

  it("skips both credential pages in open mode", () => {
    vi.stubEnv("VITE_CRM_REVIEW", "true");
    for (const [route, target] of [
      [LoginRoute, "/cartilla/teacher/crm"],
      [UnirseRoute, "/cartilla/lecciones"],
    ] as const) {
      let caught: { options?: { to?: string } } | undefined;
      try {
        route.options.beforeLoad!({} as never);
      } catch (error) {
        caught = error as typeof caught;
      }
      expect(caught?.options?.to).toBe(target);
    }
    expect(getSessionMock).not.toHaveBeenCalled();
  });

  describe("Session reset on cross-login", () => {
    it("(c) teacher login clears student session", async () => {
      const { history } = renderWithRouter(["/login"]);
      await waitFor(() => expect(history.location.pathname).toBe("/login"));

      const submitBtn = await screen.findByRole("button", { name: /entrar/i });
      const form = submitBtn.closest("form");
      await fireEvent.submit(form!);

      await waitFor(() => {
        expect(setStudentSessionMock).toHaveBeenCalledWith(null);
      });
    });

    it("(c) student login clears teacher session", async () => {
      const { history } = renderWithRouter(["/cartilla/unirse"]);
      await waitFor(() =>
        expect(history.location.pathname).toBe("/cartilla/unirse"),
      );

      // Step 1: Submit join code form
      const codeInput = (await screen.findByRole(
        "textbox",
      )) as HTMLInputElement;
      fireEvent.change(codeInput, { target: { value: "ABC123" } });

      const submitBtn = document.querySelector('button[type="submit"]');
      const form = submitBtn?.closest("form");
      if (form) {
        await fireEvent.submit(form);
      }

      // Step 2: Click student name to login
      const studentBtn = await screen.findByText("Student 1");
      await fireEvent.click(studentBtn);

      await waitFor(() => {
        expect(signOutMock).toHaveBeenCalled();
      });
    });
  });
});
