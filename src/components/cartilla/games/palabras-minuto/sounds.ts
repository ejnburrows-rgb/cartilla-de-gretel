// Soft UI tones for Palabras por minuto. Same synthesized sine-tone approach the repo already uses
// (DragBuildWord celebration tone). No voice, no recordings. Respects the app mute setting.
function muted(): boolean {
  try {
    return localStorage.getItem("cartilla:audio:muted") === "true";
  } catch {
    return false;
  }
}

function volume(): number {
  try {
    const v = Number(localStorage.getItem("cartilla:audio:volume") ?? "0.8");
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.8;
  } catch {
    return 0.8;
  }
}

function play(notes: Array<{ f: number; at: number; len: number; peak: number }>) {
  if (typeof window === "undefined" || muted()) return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const vol = volume();
    let end = 0;
    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = n.f;
      const t = ctx.currentTime + n.at;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(n.peak * vol, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.len);
      osc.start(t);
      osc.stop(t + n.len + 0.02);
      end = Math.max(end, n.at + n.len);
    }
    window.setTimeout(() => void ctx.close(), (end + 0.3) * 1000);
  } catch {
    /* no audio support */
  }
}

/** Right tap: one short bright note. */
export const playRight = () => play([{ f: 783.99, at: 0, len: 0.22, peak: 0.22 }]);
/** Wrong tap: two low soft notes going down, never a buzzer. */
export const playWrong = () =>
  play([
    { f: 392, at: 0, len: 0.18, peak: 0.16 },
    { f: 329.63, at: 0.13, len: 0.24, peak: 0.16 },
  ]);
/** Finish: the repo's C5 E5 G5 C6 celebration arpeggio. */
export const playFinish = () =>
  play(
    [523.25, 659.25, 783.99, 1046.5].map((f, i) => ({ f, at: i * 0.12, len: 0.28, peak: 0.25 })),
  );
