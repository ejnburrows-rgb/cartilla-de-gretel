import { chalkStrokes, type ChalkPoint, type ChalkStroke } from "./classroom-writing";

const WIDTH = 1280;
const HEIGHT = 720;
const PATCH = { x: 675, y: 245, width: 385, height: 280 };
const CHALK_TIP = { x: 864, y: 309 };
const FELT_CENTER = { x: 884, y: 434 };

type Point = ChalkPoint;
type Frame = HTMLCanvasElement | HTMLVideoElement;
type Painter = (progress: number) => void;
type Vertex = Point & { weight: number };

const interpolate = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const ease = (t: number) => t * t * (3 - 2 * t);

function canvas() {
  const surface = document.createElement("canvas");
  surface.width = WIDTH;
  surface.height = HEIGHT;
  return surface;
}

export function animateClassroomFrame(ms: number, paint: Painter, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return resolve();
    const start = performance.now();
    let frame = 0;
    function cleanup() {
      cancelAnimationFrame(frame);
      signal.removeEventListener("abort", finish);
    }
    function finish() {
      cleanup();
      resolve();
    }
    function update(now: number) {
      const progress = Math.max(0, Math.min(1, (now - start) / ms));
      try {
        paint(progress);
      } catch (error) {
        cleanup();
        reject(error);
        return;
      }
      if (progress < 1) frame = requestAnimationFrame(update);
      else finish();
    }
    signal.addEventListener("abort", finish, { once: true });
    frame = requestAnimationFrame(update);
  });
}

function videoEvent(video: HTMLVideoElement, event: string, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted || video.error) return resolve(false);
    const done = () => finish(true);
    const failed = () => finish(false);
    const timer = window.setTimeout(failed, 6000);
    function finish(ok: boolean) {
      window.clearTimeout(timer);
      video.removeEventListener(event, done);
      video.removeEventListener("error", failed);
      signal.removeEventListener("abort", failed);
      resolve(ok);
    }
    video.addEventListener(event, done, { once: true });
    video.addEventListener("error", failed, { once: true });
    signal.addEventListener("abort", failed, { once: true });
  });
}

async function seek(video: HTMLVideoElement, time: number, signal: AbortSignal) {
  if (signal.aborted || video.error) return false;
  if (video.readyState < 1 && !(await videoEvent(video, "loadedmetadata", signal))) return false;
  if (Math.abs(video.currentTime - time) < 0.01) {
    return video.readyState >= 2 || videoEvent(video, "loadeddata", signal);
  }
  const ready = videoEvent(video, "seeked", signal);
  video.currentTime = time;
  return ready;
}

function playRange(
  video: HTMLVideoElement,
  until: number,
  paint: () => void,
  signal: AbortSignal,
): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    let frame = 0;
    const timer = window.setTimeout(failed, 10000);
    function finish(ok: boolean) {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      video.pause();
      signal.removeEventListener("abort", failed);
      video.removeEventListener("error", failed);
      resolve(ok);
    }
    function failed() { finish(false); }
    function update() {
      try {
        if (video.readyState >= 2) paint();
      } catch {
        finish(false);
        return;
      }
      if (video.currentTime >= until) finish(true);
      else frame = requestAnimationFrame(update);
    }
    signal.addEventListener("abort", failed, { once: true });
    video.addEventListener("error", failed, { once: true });
    video.playbackRate = 2.6;
    void video.play().then(() => {
      if (!signal.aborted) frame = requestAnimationFrame(update);
    }).catch(failed);
  });
}

// The source is a complete painted frame. The mesh moves the joined sleeve,
// wrist and tool within it. Vertices on the face, frame and outer edges stay fixed.
const columns = [[450, 0], [525, 0.16], [620, 0.48], [720, 0.84], [790, 1], [935, 1], [1050, 0.66], [1145, 0.33], [1240, 0]];
const rows = [[30, 0], [125, 0.3], [210, 0.78], [285, 1], [445, 1], [525, 0.84], [600, 0.43], [650, 0]];
const mesh = rows.flatMap(([y, vertical], row) => row === rows.length - 1 ? [] :
  columns.flatMap(([x, horizontal], col) => {
    if (col === columns.length - 1) return [];
    const [nextX, nextHorizontal] = columns[col + 1];
    const [nextY, nextVertical] = rows[row + 1];
    const a = { x, y, weight: horizontal * vertical };
    const b = { x: nextX, y, weight: nextHorizontal * vertical };
    const c = { x, y: nextY, weight: horizontal * nextVertical };
    const d = { x: nextX, y: nextY, weight: nextHorizontal * nextVertical };
    return [[a, b, c], [d, c, b]];
  }),
);

function drawPose(context: CanvasRenderingContext2D, frame: Frame, dx: number, dy: number) {
  context.drawImage(frame, 0, 0, WIDTH, HEIGHT);
  if (Math.abs(dx) + Math.abs(dy) < 0.05) return;
  for (const [a, b, c] of mesh) {
    drawTriangle(context, frame, a, b, c, dx, dy);
  }
}

function drawTriangle(
  context: CanvasRenderingContext2D, frame: Frame,
  a: Vertex, b: Vertex, c: Vertex, dx: number, dy: number,
) {
  const x = a.x + dx * a.weight;
  const y = a.y + dy * a.weight;
  const bx = b.x + dx * b.weight;
  const by = b.y + dy * b.weight;
  const cx = c.x + dx * c.weight;
  const cy = c.y + dy * c.weight;
  const width = b.x - a.x;
  const height = c.y - a.y;
  const xx = (bx - x) / width;
  const xy = (by - y) / width;
  const yx = (cx - x) / height;
  const yy = (cy - y) / height;
  context.save();
  context.beginPath();
  // Stretch the clip by a pixel so browser antialiasing cannot leave seams.
  const middle = { x: (x + bx + cx) / 3, y: (y + by + cy) / 3 };
  for (const [px, py] of [[x, y], [bx, by], [cx, cy]]) {
    const amount = 1 / Math.max(1, Math.hypot(px - middle.x, py - middle.y));
    context.lineTo(px + (px - middle.x) * amount, py + (py - middle.y) * amount);
  }
  context.closePath();
  context.clip();
  context.transform(xx, xy, yx, yy, x - xx * a.x - yx * a.y, y - xy * a.x - yy * a.y);
  context.drawImage(frame, 0, 0, WIDTH, HEIGHT);
  context.restore();
}

/** Draw only on green slate pixels. Hands, fabric, chalk and felt sit in front. */
function compose(
  scene: CanvasRenderingContext2D,
  marks: CanvasRenderingContext2D | null,
  clean: ImageData,
  removeBakedLetter: boolean,
) {
  const { x, y, width, height } = PATCH;
  const frame = scene.getImageData(x, y, width, height);
  const strokes = marks?.getImageData(x, y, width, height).data;
  const pixels = frame.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const px = x + (i / 4) % width;
    const py = y + Math.floor(i / 4 / width);
    const oldLetter = px >= 768 && px < 923 && py >= 296 && py <= 405;
    const oldUnderline = px >= 735 && px <= 976 && py >= 411 && py <= 435;
    const knuckleChalk = px >= 775 && px <= 800 && py >= 372 && py <= 390;
    const dustSpeckles = px >= 835 && px <= 935 && py >= 450 && py <= 492;
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    // Replace the slate-colored fringe around the old strokes as well as the
    // chalk itself. Keep the warm hand, sleeve and felt in front of the patch.
    const slate = green - red >= 5 && green - blue >= 5;
    const chalk = green > 105 && green >= red - 12 && green - blue < 45;
    if (removeBakedLetter && (slate || (chalk && (oldLetter || oldUnderline || knuckleChalk || dustSpeckles)))) {
      const edgeDistance = Math.min(px - x, x + width - 1 - px, py - y, y + height - 1 - py);
      const opacity = Math.min(1, edgeDistance / 26);
      for (let channel = 0; channel < 3; channel += 1) {
        pixels[i + channel] += (clean.data[i + channel] - pixels[i + channel]) * opacity;
      }
    }
    if (!strokes) continue;
    const alpha = strokes[i + 3] / 255;
    if (!alpha || pixels[i + 1] - pixels[i] < 7 || pixels[i + 1] - pixels[i + 2] < 5) continue;
    for (let channel = 0; channel < 3; channel += 1) {
      pixels[i + channel] = pixels[i + channel] * (1 - alpha) + strokes[i + channel] * alpha;
    }
  }
  scene.putImageData(frame, x, y);
}

function drawSegment(marks: CanvasRenderingContext2D, start: Point, end: Point) {
  marks.beginPath();
  marks.moveTo(start.x, start.y);
  marks.lineTo(end.x, end.y);
  marks.stroke();
}

function strokeDistance(stroke: ChalkStroke) {
  return stroke.slice(1).reduce((length, point, index) =>
    length + Math.hypot(point.x - stroke[index].x, point.y - stroke[index].y), 0);
}

/** All stroke pixels removed by this function lie under the painted felt pad. */
export function eraseFelt(marks: CanvasRenderingContext2D, center: Point) {
  marks.save();
  marks.translate(center.x, center.y);
  marks.rotate(-0.54);
  marks.globalCompositeOperation = "destination-out";
  marks.fillStyle = "#000";
  marks.fillRect(-58, -12, 116, 24);
  marks.restore();
}

export async function playClassroomWriting(
  video: HTMLVideoElement,
  output: HTMLCanvasElement,
  blankSlate: HTMLImageElement,
  target: string,
  signal: AbortSignal,
  onPhase: (phase: string) => void,
): Promise<boolean> {
  const glyphs = chalkStrokes(target);
  const scene = output.getContext("2d", { willReadFrequently: true });
  const trace = canvas().getContext("2d", { willReadFrequently: true });
  if (!scene || !trace || !glyphs.length || !(await seek(video, 0, signal))) return false;

  output.width = WIDTH;
  output.height = HEIGHT;
  trace.strokeStyle = "rgba(248, 240, 218, .94)";
  trace.lineWidth = 6;
  trace.lineJoin = "round";
  trace.lineCap = "round";

  try {
    await blankSlate.decode();
  } catch {
    return false;
  }
  if (signal.aborted) return false;
  scene.drawImage(blankSlate, 0, 0, WIDTH, HEIGHT);
  const clean = scene.getImageData(PATCH.x, PATCH.y, PATCH.width, PATCH.height);
  onPhase("turning");
  if (!(await playRange(video, 7, () => scene.drawImage(video, 0, 0, WIDTH, HEIGHT), signal))) return false;
  if (!(await seek(video, 7, signal))) return false;

  let toolPose: Frame = video;
  const draw = (point: Point, origin: Point) => {
    drawPose(scene, toolPose, point.x - origin.x, point.y - origin.y);
    compose(scene, trace, clean, false);
  };

  let tip = CHALK_TIP;
  for (const [index, stroke] of glyphs.entries()) {
    if (signal.aborted) return false;
    onPhase(index === glyphs.length - 1 ? "underlining" : "writing");
    const previous = tip;
    await animateClassroomFrame(180, (t) => draw(interpolate(previous, stroke[0], ease(t)), CHALK_TIP), signal);
    let last = stroke[0];
    let painted = 0;
    await animateClassroomFrame(Math.max(150, strokeDistance(stroke) * 4.0), (t) => {
      const cursor = t * (stroke.length - 1);
      const vertex = Math.floor(cursor);
      while (painted < vertex) {
        drawSegment(trace, last, stroke[++painted]);
        last = stroke[painted];
      }
      const next = interpolate(stroke[vertex], stroke[Math.min(vertex + 1, stroke.length - 1)], cursor - vertex);
      drawSegment(trace, last, next);
      last = next;
      draw(next, CHALK_TIP);
    }, signal);
    tip = stroke[stroke.length - 1];
  }
  await animateClassroomFrame(450, () => draw(tip, CHALK_TIP), signal);

  if (!(await seek(video, 13.2, signal))) return false;
  onPhase("taking-eraser");
  if (!(await playRange(video, 18.7, () => {
    scene.drawImage(video, 0, 0, WIDTH, HEIGHT);
    compose(scene, trace, clean, true);
  }, signal))) return false;
  if (!(await seek(video, 21, signal))) return false;

  // The source still carries a short piece of its original underline here.
  // Clean it before moving the pose so it cannot travel with the eraser.
  const eraserPose = canvas();
  const eraserFrame = eraserPose.getContext("2d");
  if (!eraserFrame) return false;
  eraserFrame.drawImage(video, 0, 0, WIDTH, HEIGHT);
  compose(eraserFrame, null, clean, true);
  toolPose = eraserPose;

  onPhase("erasing");
  const allPoints = glyphs.flat();
  const left = Math.min(...allPoints.map((point) => point.x));
  const right = Math.max(...allPoints.map((point) => point.x));
  const top = Math.min(...allPoints.map((point) => point.y));
  const bottom = Math.max(...allPoints.map((point) => point.y));
  let felt = FELT_CENTER;
  const passes = Math.ceil((bottom - top) / 22);
  for (let pass = 0; pass <= passes; pass += 1) {
    const y = top + (bottom - top) * pass / Math.max(1, passes);
    const start = { x: pass % 2 === 0 ? left + 6 : right - 6, y };
    const end = { x: pass % 2 === 0 ? right - 6 : left + 6, y };
    const previous = felt;
    await animateClassroomFrame(140, (t) => {
      const center = interpolate(previous, start, ease(t));
      eraseFelt(trace, center);
      draw(center, FELT_CENTER);
    }, signal);
    await animateClassroomFrame(340, (t) => {
      const center = interpolate(start, end, ease(t));
      eraseFelt(trace, center);
      draw(center, FELT_CENTER);
    }, signal);
    felt = end;
  }
  await animateClassroomFrame(210, (t) => draw(interpolate(felt, FELT_CENTER, ease(t)), FELT_CENTER), signal);

  onPhase("returning");
  return playRange(video, 24.0, () => {
    scene.drawImage(video, 0, 0, WIDTH, HEIGHT);
    compose(scene, trace, clean, true);
  }, signal);
}
