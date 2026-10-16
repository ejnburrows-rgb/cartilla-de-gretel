import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Route } from "../src/routes/cartilla/practica";
import * as SpeakMod from "../src/lib/speak";
import { LanguageProvider } from "../src/context/LanguageContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, createMemoryHistory, Outlet } from '@tanstack/react-router';

vi.mock("../src/lib/speak", () => ({
  speak: vi.fn(),
}));

const PracticaComponent = Route.options.component;

describe("Practica route", () => {
  let router;
  let queryClient;
  
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const rootRoute = createRootRoute({
        component: () => <Outlet />
    });
    const practicaRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: PracticaComponent,
    });
    router = createRouter({
      routeTree: rootRoute.addChildren([practicaRoute]),
      history: createMemoryHistory(),
    });
    await router.load();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    // Clear and restore fake timers is moved to within test
  });

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </QueryClientProvider>
    );
  };

  it("speaks the first card's actual syllable upon starting", async () => {
    renderComponent();
    
    await act(async () => {});
    
    const startButton = screen.getByRole("button", { name: /empezar/i });
    expect(startButton).toBeInTheDocument();
    
    act(() => { startButton.click(); });
    
    act(() => { vi.advanceTimersByTime(150); });
    
    expect(SpeakMod.speak).toHaveBeenCalledTimes(1);
    const spokenSyllable = vi.mocked(SpeakMod.speak).mock.calls[0][0];
    
    const optionButton = screen.getByRole("button", { name: new RegExp(`^${spokenSyllable}$`, 'i') });
    expect(optionButton).toBeInTheDocument();
    
    act(() => { optionButton.click(); });
    act(() => { vi.advanceTimersByTime(400); });
    
    expect(SpeakMod.speak).toHaveBeenCalledTimes(2);
    
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("calculates time remaining accurately even if timer is delayed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    renderComponent();
    
    await act(async () => {});
    
    const startButton = screen.getByRole("button", { name: /empezar/i });
    act(() => { startButton.click(); });
    
    expect(screen.getAllByText((content, element) => {
        return content === "60" || element?.textContent === "60s";
    })[0]).toBeInTheDocument();
    
    // Fast forward System time by 10s
    act(() => {
      vi.setSystemTime(new Date('2024-01-01T00:00:10Z'));
      vi.advanceTimersByTime(1000); 
    });
    
    expect(screen.getAllByText((content, element) => {
        // It might be 50 or 49 depending on how exactly React bats
        return content === "50" || element?.textContent === "50s" || element?.textContent === "49s" || content === "49";
    })[0]).toBeInTheDocument();
    
    // Fast forward System time by 50s
    act(() => {
      vi.setSystemTime(new Date('2024-01-01T00:01:00Z'));
      vi.advanceTimersByTime(1000); 
    });
    
    expect(screen.getByText(/¡Tiempo!/i)).toBeInTheDocument();
    
    vi.clearAllTimers();
    vi.useRealTimers();
  });
});
