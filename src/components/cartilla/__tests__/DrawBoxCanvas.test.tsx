import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DrawBoxCanvas } from "../DrawBoxCanvas";
// Stub out ActivityEventsProvider since it might be missing or wrongly imported in test context
const MockProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
vi.mock("@/lib/activity-events", () => ({
  useActivityEvents: () => ({ emit: vi.fn(), record: vi.fn() }),
  ActivityEventsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe("DrawBoxCanvas", () => {
  let originalGetContext: any;
  let getBoundingClientRectMock: any;
  
  beforeEach(() => {
    vi.restoreAllMocks();
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    getBoundingClientRectMock = vi.fn().mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
    window.HTMLElement.prototype.getBoundingClientRect = getBoundingClientRectMock;
  });
  
  afterEach(() => {
     HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("should preserve drawing across window resize", () => {
    const drawImageMock = vi.fn();
    const scaleMock = vi.fn();

    // Mock HTMLCanvasElement.getContext
    const getContextMock = vi.fn().mockImplementation((type) => {
      if (type === "2d") {
        return {
          drawImage: drawImageMock,
          scale: scaleMock,
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          clearRect: vi.fn(),
        };
      }
      return null;
    });
    
    HTMLCanvasElement.prototype.getContext = getContextMock as any;

    const { unmount, container } = render(
      <MockProvider>
        <DrawBoxCanvas regionId="test" />
      </MockProvider>
    );

    // Initial resize inside useEffect calls getContext and scale
    expect(getContextMock).toHaveBeenCalled();
    expect(scaleMock).toHaveBeenCalled();

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    
    // Simulate setting width and height explicitly to positive values
    Object.defineProperty(canvas, 'width', { value: 100, writable: true });
    Object.defineProperty(canvas, 'height', { value: 100, writable: true });

    // Clear initial calls
    drawImageMock.mockClear();
    
    // Trigger window resize
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // Check if drawImage was called to restore the snapshot
    // First it creates offscreen canvas and draws existing canvas on it.
    // Then it restores offscreen canvas to main canvas.
    expect(drawImageMock).toHaveBeenCalled();
    
    // Cleanup
    unmount();
  });
});
