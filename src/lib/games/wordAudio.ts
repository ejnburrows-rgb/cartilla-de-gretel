import recordings from "@/content/picture-name-recordings.json";

const key = (text: string) => text.normalize("NFC").trim().toLocaleLowerCase("es");
export function recordedWordUrl(text: string): string | undefined {
  return recordings.approved.find((item) => item.key === key(text) && item.approval)?.src;
}
// Instructions and rewards are exact-text slots, not word-clip stitching.
export const GAME_INSTRUCTION_RECORDINGS: Record<string, string | undefined> = {};
export const GAME_REWARD_RECORDINGS: Record<string, string | undefined> = {};
let active: HTMLAudioElement | undefined;
export function stopGameAudio(): void {
  active?.pause();
  active = undefined;
}
function playUrl(url?: string): void {
  stopGameAudio();
  if (!url || typeof window === "undefined") return;
  if (localStorage.getItem("cartilla:audio:muted") === "true") return;
  try {
    const audio = new Audio(url);
    active = audio;
    const finish = () => {
      if (active === audio) active = undefined;
    };
    audio.onended = finish;
    audio.onerror = finish;
    void audio.play().catch(finish);
  } catch {
    active = undefined;
  }
}
export function playWord(url?: string, text?: string): void {
  playUrl(url || (text ? recordedWordUrl(text) : undefined));
}
export function playInstruction(url?: string, text?: string): void {
  playUrl(url || (text ? GAME_INSTRUCTION_RECORDINGS[text] : undefined));
}
export function playReward(text: string): void {
  playUrl(GAME_REWARD_RECORDINGS[text]);
}
