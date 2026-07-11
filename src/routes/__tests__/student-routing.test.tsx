/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { routeTree } from "@/routeTree.gen";

// Mocks
const getStudentSessionMock = vi.fn();
const setStudentSessionMock = vi.fn();

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => getStudentSessionMock(),
  setStudentSession: (s: any) => setStudentSessionMock(s),
  useStudentSession: () => getStudentSessionMock(),
}));

const signOutMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signOut: (...args: any[]) => signOutMock(...args),
      getSession: () => getSessionMock(),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

vi.mock("@/lib/useServerFn", () => ({
  useServerFn: () => vi.fn().mockResolvedValue([{ studentId: "s1", displayName: "Student 1" }]),
}));

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({ t: (k: string) => k, language: "es" }),
  LanguageProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: any) => <>{children}</>,
  QueryClient: vi.fn().mockImplementation(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
  })),
  useQueryClient: () => ({}),
  useQuery: () => ({ data: [], isLoading: false }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { createMemoryHistory, createRouter, RouterProvider, createRootRouteWithContext, createRoute, Outlet } from "@tanstack/react-router";
import { Route as LoginRoute } from "../login";
import { Route as UnirseRoute } from "../cartilla/unirse";
import { Route as AuthenticatedRoute } from "../_authenticated";
import { Route as PresentarRoute } from "../cartilla/presentar.$n";

function renderWithRouter(initialEntries: string[]) {
  const history = createMemoryHistory({ initialEntries });
  
  const rootRoute = createRootRouteWithContext<{ queryClient: any }>()({ component: Outlet });
  const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginRoute.options.component });
  const unirseRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cartilla/unirse", component: UnirseRoute.options.component });
  
  const authenticatedRoute = createRoute({ 
    getParentRoute: () => rootRoute, 
    path: "/_authenticated", 
    component: AuthenticatedRoute.options.component,
    beforeLoad: AuthenticatedRoute.options.beforeLoad 
  });
  const studentsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: "/students", component: () => <div>Students</div> });

  const routeTree = rootRoute.addChildren([loginRoute, unirseRoute, authenticatedRoute.addChildren([studentsRoute])]);
  const router = createRouter({ routeTree, history, context: { queryClient: {} as any } });
  render(<RouterProvider router={router} />);
  return { router, history };
}

describe("Student-Teacher Routing Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStudentSessionMock.mockReturnValue(null);
    getSessionMock.mockResolvedValue({ data: { session: null } });
  });

  it("(a) student login lands on /cartilla/lecciones", async () => {
    const { history } = renderWithRouter(["/cartilla/unirse"]);
    await waitFor(() => expect(history.location.pathname).toBe("/cartilla/unirse"));
    
    const codeInput = await screen.findByRole("textbox") as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: "ABC123" } });
    
    const submitBtn = document.querySelector('button[type="submit"]');
    const form = submitBtn?.closest('form');
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
    it("(b) blocks student session from teacher presentation route", async () => {
      getStudentSessionMock.mockReturnValue({ studentId: "s1" });
      const mod = await import("../cartilla/presentar.$n");
      const Route = mod.Route;

      let caught: any;
      try {
        await Route.options.beforeLoad!({ params: { n: "1" }, location: { href: "" } } as any);
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeDefined();
      expect(caught.options.to).toBe("/cartilla/lecciones");
    });
  });

  describe("_authenticated.tsx route guard", () => {
    it("(b) blocks student session from teacher _authenticated route", async () => {
      getStudentSessionMock.mockReturnValue({ studentId: "s1" });
      const { history } = renderWithRouter(["/_authenticated/cartilla/teacher/students"]);
      
      await waitFor(() => {
        expect(history.location.pathname).toBe("/cartilla/lecciones");
      });
    });
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
      await waitFor(() => expect(history.location.pathname).toBe("/cartilla/unirse"));
      
      // Step 1: Submit join code form
      const codeInput = await screen.findByRole("textbox") as HTMLInputElement;
      fireEvent.change(codeInput, { target: { value: "ABC123" } });
      
      const submitBtn = document.querySelector('button[type="submit"]');
      const form = submitBtn?.closest('form');
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
