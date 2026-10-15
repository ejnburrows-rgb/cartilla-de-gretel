// DrawBoxCanvas.resize.test.tsx — REAL regression test for #794.
//
// Uses a faithful in-memory 2D context: assigning canvas.width/height CLEARS
// pixels (real browser semantics) and drawImage copies/scales pixel buffers.
// This proves a child's drawing survives a window resize with the fix, and is
// wiped out without it. A mock that only asserts "drawImage was called" can
// pass against a broken implementation; this test cannot.
import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DrawBoxCanvas } from "../DrawBoxCanvas";
import "@testing-library/jest-dom";

vi.mock("@/lib/activity-events", () => ({
  useActivityEvents: () => ({ emit: vi.fn(), record: vi.fn() }),
}));

// ---------------------------------------------------------------------------
// Faithful fake 2D context: real pixel buffer, real clear-on-resize semantics.
// ---------------------------------------------------------------------------
type RGBA = [number, number, number, number];
const ctxMap = new WeakMap<HTMLCanvasElement, FakeCtx>();

class FakeCtx {
  canvas: HTMLCanvasElement;
  buf: Uint8ClampedArray;
  fillStyle = "#000000";
  strokeStyle = "#000000";
  lineWidth = 1;
  lineCap = "butt";
  lineJoin = "miter";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.buf = new Uint8ClampedArray(canvas.width * canvas.height * 4);
  }
  get w() {
    return this.canvas.width;
  }
  get h() {
    return this.canvas.height;
  }
  /** Reallocate a cleared buffer at the canvas's current size. */
  clear() {
    this.buf = new Uint8ClampedArray(this.w * this.h * 4);
  }
  private parseColor(s: string): RGBA {
    const m = /^#([0-9a-f]{6})$/i.exec(s);
    if (!m) return [0, 0, 0, 255];
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }
  fillRect(x: number, y: number, w: number, h: number) {
    const [r, g, b, a] = this.parseColor(this.fillStyle);
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.w, Math.ceil(x + w));
    const y1 = Math.min(this.h, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * this.w + xx) * 4;
        this.buf[i] = r;
        this.buf[i + 1] = g;
        this.buf[i + 2] = b;
        this.buf[i + 3] = a;
      }
  }
  clearRect(x: number, y: number, w: number, h: number) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.w, Math.ceil(x + w));
    const y1 = Math.min(this.h, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * this.w + xx) * 4;
        this.buf[i] = 0;
        this.buf[i + 1] = 0;
        this.buf[i + 2] = 0;
        this.buf[i + 3] = 0;
      }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drawImage(...args: any[]) {
    let src: HTMLCanvasElement;
    let sx: number, sy: number, sw: number, sh: number;
    let dx: number, dy: number, dw: number, dh: number;
    if (args.length === 3) {
      [src, dx, dy] = args;
      sx = 0;
      sy = 0;
      sw = src.width;
      sh = src.height;
      dw = sw;
      dh = sh;
    } else if (args.length === 9) {
      [src, sx, sy, sw, sh, dx, dy, dw, dh] = args;
    } else {
      throw new Error(`unsupported drawImage arity ${args.length}`);
    }
    const sctx = ctxMap.get(src);
    if (!sctx) return;
    const sbuf = sctx.buf;
    const swd = src.width;
    const dx0 = Math.floor(dx);
    const dy0 = Math.floor(dy);
    for (let yy = 0; yy < dh; yy++)
      for (let xx = 0; xx < dw; xx++) {
        const tx = dx0 + xx;
        const ty = dy0 + yy;
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const px = Math.min(swd - 1, Math.floor(sx + (xx / dw) * sw));
        const py = Math.min(src.height - 1, Math.floor(sy + (yy / dh) * sh));
        const si = (py * swd + px) * 4;
        const di = (ty * this.w + tx) * 4;
        this.buf[di] = sbuf[si];
        this.buf[di + 1] = sbuf[si + 1];
        this.buf[di + 2] = sbuf[si + 2];
        this.buf[di + 3] = sbuf[si + 3];
      }
  }
  getImageData(x: number, y: number, w: number, h: number) {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let yy = 0; yy < h; yy++)
      for (let xx = 0; xx < w; xx++) {
        const sx = x + xx;
        const sy = y + yy;
        if (sx < 0 || sy < 0 || sx >= this.w || sy >= this.h) continue;
        const si = (sy * this.w + sx) * 4;
        const di = (yy * w + xx) * 4;
        data[di] = this.buf[si];
        data[di + 1] = this.buf[si + 1];
        data[di + 2] = this.buf[si + 2];
        data[di + 3] = this.buf[si + 3];
      }
    return { data, width: w, height: h };
  }
  scale() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
}

let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;

beforeEach(() => {
  originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type: string) {
    if (type !== "2d") return null;
    let c = ctxMap.get(this);
    if (!c) {
      c = new FakeCtx(this);
      ctxMap.set(this, c);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return c as any;
  };
});

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
});

/** Make width/height assignment clear pixels, like a real browser. */
function trackSizeClearing(canvas: HTMLCanvasElement) {
  let w = canvas.width;
  let h = canvas.height;
  const cleared = () => {
    const c = ctxMap.get(canvas);
    if (c) c.clear();
  };
  Object.defineProperty(canvas, "width", {
    configurable: true,
    get: () => w,
    set: (v: number) => {
      w = v;
      cleared();
    },
  });
  Object.defineProperty(canvas, "height", {
    configurable: true,
    get: () => h,
    set: (v: number) => {
      h = v;
      cleared();
    },
  });
}

function fakeRect(width: number, height: number): DOMRect {
  return {
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect;
}

const RED: RGBA = [220, 38, 38, 255]; // #dc2626

describe("DrawBoxCanvas preserves drawing across resize (#794)", () => {
  it("keeps the drawing visible after the canvas is resized", () => {
    const { container, unmount } = render(<DrawBoxCanvas regionId="test" />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;

    // Initial layout: 200x100 (devicePixelRatio = 1 in jsdom).
    canvas.getBoundingClientRect = () => fakeRect(200, 100);
    // Re-run the mount effect's resize with the faked rect by remounting state:
    // simplest is to trigger the already-registered listener after faking.
    trackSizeClearing(canvas);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);

    // Simulate the child drawing: a red block at (10,10)-(50,50).
    const ctx = canvas.getContext("2d") as unknown as FakeCtx;
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(10, 10, 40, 40);
    const before = ctx.getImageData(30, 30, 1, 1).data;
    expect(Array.from(before)).toEqual([...RED]);

    // Window grows: canvas becomes 400x200. The drawing must survive,
    // scaled 2x, so the block now covers (20,20)-(100,100).
    canvas.getBoundingClientRect = () => fakeRect(400, 200);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);

    const after = (ctx as FakeCtx).getImageData(60, 60, 1, 1).data;
    expect(Array.from(after)).toEqual([...RED]);

    unmount();
  });

  it("does not leave the canvas blank when only the height changes", () => {
    const { container, unmount } = render(<DrawBoxCanvas regionId="test" />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;

    canvas.getBoundingClientRect = () => fakeRect(200, 100);
    trackSizeClearing(canvas);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    const ctx = canvas.getContext("2d") as unknown as FakeCtx;
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(10, 10, 40, 40);

    canvas.getBoundingClientRect = () => fakeRect(200, 300);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(canvas.height).toBe(300);

    // Block scales vertically 3x: (10,10)-(50,50) -> (10,30)-(50,150).
    const after = (ctx as FakeCtx).getImageData(30, 90, 1, 1).data;
    expect(Array.from(after)).toEqual([...RED]);

    unmount();
  });
});
