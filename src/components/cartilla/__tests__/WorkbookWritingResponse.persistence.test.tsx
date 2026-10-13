import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCanvas, Image as CanvasImage, type Canvas } from "@napi-rs/canvas";
import { WorkbookWritingResponse } from "../WorkbookWritingResponse";
import {
  canvasStorageKey,
  loadCanvasSnapshot,
  saveCanvasSnapshot,
} from "@/lib/activity-canvas-store";
import { learnerStorageKey } from "@/lib/learner-storage";
import { setStudentSession } from "@/lib/student-session";
const events = vi.hoisted(() => ({ emit: vi.fn() }));
vi.mock("@/lib/activity-events", () => ({ useActivityEvents: () => events }));
vi.mock("@/lib/piano-audio", () => ({ playCorrectChord: vi.fn() }));
let backing = new WeakMap<HTMLCanvasElement, Canvas>();
class DeferredImage {
  readonly image = new CanvasImage();
  onload?: () => void;
  onerror?: () => void;
  get width() {
    return this.image.width;
  }
  get height() {
    return this.image.height;
  }
  set src(value: string) {
    this.image.src = Buffer.from(value.split(",")[1], "base64");
    pending.push(this);
  }
}
let pending: DeferredImage[] = [];
function native(el: HTMLCanvasElement) {
  let c = backing.get(el);
  if (!c) {
    c = createCanvas(el.width, el.height);
    backing.set(el, c);
  }
  if (c.width !== el.width) c.width = el.width;
  if (c.height !== el.height) c.height = el.height;
  return c;
}
async function loadImages() {
  const images = pending.splice(0);
  await Promise.all(images.map((image) => image.image.decode()));
  act(() => {
    for (const image of images) image.onload?.();
  });
}
const canvas = () => screen.getByLabelText("Área para escribir a mano alzada") as HTMLCanvasElement;
function stroke(erase = false) {
  if (erase) fireEvent.click(screen.getByRole("button", { name: "Borrador de goma" }));
  fireEvent.pointerDown(canvas(), { clientX: 20, clientY: 20 });
  fireEvent.pointerMove(canvas(), { clientX: 120, clientY: 20 });
  fireEvent.pointerUp(canvas());
}
async function freehand() {
  fireEvent.click(screen.getByRole("button", { name: "Mano alzada" }));
  await loadImages();
}
function mount() {
  return render(<WorkbookWritingResponse pageNumber={90} interactive />);
}
function seedInk() {
  const c = createCanvas(300, 180);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(20, 20, 100, 4);
  saveCanvasSnapshot("writing:90", c.toDataURL("image/png"));
}
beforeEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  events.emit.mockClear();
  pending = [];
  backing = new WeakMap();
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(180);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 300,
    height: 180,
    bottom: 180,
    right: 300,
    toJSON() {},
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement,
  ) {
    const ctx = native(this).getContext("2d");
    return new Proxy(ctx, {
      get(target, prop) {
        if (prop === "drawImage")
          return (image: HTMLCanvasElement | CanvasImage, ...args: number[]) => {
            const source =
              image instanceof HTMLCanvasElement
                ? native(image)
                : image instanceof DeferredImage
                  ? image.image
                  : image;
            return (target.drawImage as (...a: unknown[]) => void)(source, ...args);
          };
        const value = Reflect.get(target, prop, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target, prop, value) {
        return Reflect.set(target, prop, value, target);
      },
    }) as unknown as CanvasRenderingContext2D;
  });
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(function (
    this: HTMLCanvasElement,
  ) {
    return native(this).toDataURL("image/png");
  });
  vi.stubGlobal("Image", DeferredImage);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("remaining handwriting and completion", () => {
  it("erasing an empty canvas never qualifies as work", async () => {
    mount();
    await freehand();
    stroke(true);
    expect(screen.getByRole("button", { name: "Listo" })).toBeDisabled();
  });
  it("draw→complete, erase all→incomplete, and clear→retry", async () => {
    mount();
    await freehand();
    stroke();
    fireEvent.click(screen.getByRole("button", { name: "Listo" }));
    expect(screen.getByRole("button", { name: "Completado" })).toBeTruthy();
    stroke(true);
    expect(screen.getByRole("button", { name: "Listo" })).toBeDisabled();
    expect(localStorage.getItem(learnerStorageKey("cartilla-writing-page-90-done"))).toBeNull();
    expect(events.emit).toHaveBeenCalledWith("activity:retry", { reason: "work-cleared" });
    fireEvent.click(screen.getByRole("button", { name: "Borrador de goma" }));
    stroke();
    fireEvent.click(screen.getByRole("button", { name: "Listo" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpiar trazo" }));
    expect(screen.getByRole("button", { name: "Listo" })).toBeDisabled();
  });
  it("sufficient typed writing keeps completion after ink is cleared", async () => {
    mount();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mi oración" } });
    await freehand();
    stroke();
    fireEvent.click(screen.getByRole("button", { name: "Listo" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpiar trazo" }));
    expect(screen.getByRole("button", { name: "Completado" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Teclado" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: "Listo" })).toBeDisabled();
  });
  it("does not trust a saved completion flag or a blank PNG", async () => {
    saveCanvasSnapshot("writing:90", createCanvas(300, 180).toDataURL("image/png"));
    localStorage.setItem(learnerStorageKey("cartilla-writing-page-90-done"), "true");
    mount();
    await loadImages();
    await freehand();
    expect(screen.getByRole("button", { name: "Listo" })).toBeDisabled();
    expect(events.emit).not.toHaveBeenCalledWith("activity:complete", { restored: true });
  });
  it("restores completed real ink even in typed mode, then revokes only when that ink is erased", async () => {
    seedInk();
    localStorage.setItem(learnerStorageKey("cartilla-writing-page-90-done"), "true");
    mount();
    await loadImages();
    expect(screen.getByRole("button", { name: "Completado" })).toBeTruthy();
    await freehand();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar trazo" }));
    expect(screen.getByRole("button", { name: "Listo" })).toBeDisabled();
  });
});
describe("interrupted handwriting and stale restores", () => {
  it.each(["unmount", "pagehide", "hidden"])(
    "saves an interrupted stroke on %s and restores it after remount",
    async (event) => {
      const view = mount();
      await freehand();
      fireEvent.pointerDown(canvas(), { clientX: 20, clientY: 20 });
      fireEvent.pointerMove(canvas(), { clientX: 120, clientY: 20 });
      const drawn = canvas().toDataURL();
      if (event === "unmount") view.unmount();
      else if (event === "pagehide") window.dispatchEvent(new Event("pagehide"));
      else {
        vi.spyOn(document, "hidden", "get").mockReturnValue(true);
        document.dispatchEvent(new Event("visibilitychange"));
      }
      expect(loadCanvasSnapshot("writing:90")?.dataUrl).toBe(drawn);
      cleanup();
      mount();
      await loadImages();
      expect(canvas().toDataURL()).toBe(drawn);
    },
  );
  it("saves an interrupted stroke before switching to typed mode", async () => {
    mount();
    await freehand();
    fireEvent.pointerDown(canvas(), { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas(), { clientX: 120, clientY: 20 });
    const drawn = canvas().toDataURL();
    fireEvent.click(screen.getByRole("button", { name: "Teclado" }));
    expect(loadCanvasSnapshot("writing:90")?.dataUrl).toBe(drawn);
    await freehand();
    expect(canvas().toDataURL()).toBe(drawn);
  });
  it("a tap without drawing while restore is pending cannot overwrite saved ink", async () => {
    seedInk();
    const saved = loadCanvasSnapshot("writing:90")?.dataUrl;
    localStorage.setItem(learnerStorageKey("cartilla-writing-page-90-mode"), "freehand");
    mount();
    fireEvent.pointerDown(canvas(), { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas());
    expect(loadCanvasSnapshot("writing:90")?.dataUrl).toBe(saved);
    await loadImages();
    expect(screen.getByRole("button", { name: "Listo" })).toBeEnabled();
  });
  it.each(["draw", "clear"])("late image restoration cannot replace newer %s", async (action) => {
    seedInk();
    localStorage.setItem(learnerStorageKey("cartilla-writing-page-90-mode"), "freehand");
    mount();
    if (action === "draw") {
      fireEvent.pointerDown(canvas(), { clientX: 30, clientY: 80 });
      fireEvent.pointerMove(canvas(), { clientX: 150, clientY: 80 });
      fireEvent.pointerUp(canvas());
    } else fireEvent.click(screen.getByRole("button", { name: "Limpiar trazo" }));
    const latest = canvas().toDataURL();
    await loadImages();
    expect(canvas().toDataURL()).toBe(latest);
  });
  it("switching learners mid-stroke saves to A, never B, and restores A on return", async () => {
    const student = (studentId: string) => ({
      studentId,
      classId: "class",
      studentName: studentId,
      studentCode: studentId,
      className: "Class",
    });
    setStudentSession(student("A"));
    mount();
    await freehand();
    fireEvent.pointerDown(canvas(), { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas(), { clientX: 120, clientY: 20 });
    const drawn = canvas().toDataURL();
    act(() => setStudentSession(student("B")));
    expect(
      JSON.parse(
        localStorage.getItem("cartilla.activity.canvas.v1:paint:writing:90:student:class:A")!,
      ).dataUrl,
    ).toBe(drawn);
    expect(loadCanvasSnapshot("writing:90")).toBeNull();
    expect(screen.getByRole("textbox")).toHaveValue("");
    act(() => setStudentSession(student("A")));
    await loadImages();
    expect(canvas().toDataURL()).toBe(drawn);
  });
});
