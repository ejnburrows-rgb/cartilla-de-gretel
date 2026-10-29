import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DrawBoxCanvas } from "../DrawBoxCanvas";
vi.mock("@/lib/activity-events", () => ({
  useActivityEvents: () => ({ emit: vi.fn(), record: vi.fn() }),
}));
const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(image);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function write(canvas: HTMLCanvasElement) {
  canvas.setPointerCapture = vi.fn();
  fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
  fireEvent.pointerMove(canvas, { clientX: 30, clientY: 30 });
  fireEvent.pointerUp(canvas);
  fireEvent.click(screen.getByRole("button", { name: "Listo" }));
}
describe("memory-only completed preview work", () => {
  it("keeps the completed drawing visible after resize", () => {
    const { container } = render(<DrawBoxCanvas regionId="preview" retainCompletedImage />);
    write(container.querySelector("canvas")!);
    expect(screen.getByRole("img", { name: "Tu trabajo terminado" }).getAttribute("src")).toBe(image);
    fireEvent(window, new Event("resize"));
    expect(screen.getByRole("img", { name: "Tu trabajo terminado" }).getAttribute("src")).toBe(image);
    expect(container.querySelector("canvas")).toBeNull();
  });
  it("preserves the existing production canvas behavior by default", () => {
    const { container } = render(<DrawBoxCanvas regionId="normal" />);
    write(container.querySelector("canvas")!);
    expect(container.querySelector("canvas")).not.toBeNull();
    expect(HTMLCanvasElement.prototype.toDataURL).not.toHaveBeenCalled();
  });
});
