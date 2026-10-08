import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { approvedPictureRecording, resolvePictureName } from '../picture-vocabulary';
import vocabulary from '@/content/picture-vocabulary.json';
import { AUDIO_POLICY } from '@/content/audio-manifest';
import { installPictureAudio, playPictureName, stopPicturePlayback } from '../picture-audio';
import { claimSpeech, stopSpeech } from '../speech-playback';
import { speakAsGretel, setGretelVoiceMuted } from '../gretel-voice';
import { audioEngine } from '../audio-engine';
import { LivingIllustration } from '@/components/living/LivingIllustration';
import { TapToHear } from '@/cartilla/interactions/TapToHear';

vi.mock('../picture-vocabulary', async original => ({ ...await original<typeof import('../picture-vocabulary')>(), approvedPictureRecording: vi.fn() }));
vi.mock('@/content/audio-manifest', () => ({ AUDIO_POLICY: { allowTts: false } }));
const oso = vocabulary.find(entry => entry.key === 'oso')!;
const olla = vocabulary.find(entry => entry.key === 'olla')!;
class FakeAudio {
  static instances: FakeAudio[] = [];
  volume = 1; src: string; onended: (() => void) | null = null; onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve()); pause = vi.fn(); load = vi.fn();
  removeAttribute = vi.fn(() => { this.src = ''; });
  constructor(src: string) { this.src = src; FakeAudio.instances.push(this); }
}
class FakeUtterance {
  text: string; lang = ''; volume = 1; voice: unknown; rate = 1; pitch = 1;
  onstart: (() => void) | null = null; onend: (() => void) | null = null; onerror: (() => void) | null = null;
  constructor(text: string) { this.text = text; }
}
const speech = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [{ name: 'Test Spanish', lang: 'es-MX', localService: true }], addEventListener: vi.fn(), removeEventListener: vi.fn() };
let uninstall: (() => void) | undefined;
beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks(); FakeAudio.instances = [];
  vi.stubGlobal('Audio', FakeAudio); vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech });
  setGretelVoiceMuted(false); stopSpeech();
  (AUDIO_POLICY as { allowTts: boolean }).allowTts = false;
  vi.mocked(approvedPictureRecording).mockReturnValue(undefined);
});
afterEach(() => { uninstall?.(); uninstall = undefined; stopSpeech(); setGretelVoiceMuted(false); cleanup(); vi.unstubAllGlobals(); });

it('uses authored content names and refuses filename guesses or arbitrary names', () => {
  expect(resolvePictureName(oso.images[0]!, 'oso')?.name.toLowerCase()).toBe('oso');
  expect(resolvePictureName('/misleading-oso-file.webp', 'oso')).toBeNull();
  expect(resolvePictureName(oso.images[0]!, 'avión')).toBeNull();
  expect(playPictureName({ key: 'fake', name: 'inventado', images: ['/oso.webp'] })).toBe('unverified');
});
it('uses the approved recording path and cancels/releases previous recordings on quick taps', () => {
  vi.mocked(approvedPictureRecording).mockImplementation(key => `/test-approved/${key}.mp3`);
  expect(playPictureName(oso)).toBe('recorded');
  const first = FakeAudio.instances[0]!;
  expect(first.src).toBe('/test-approved/oso.mp3'); expect(first.play).toHaveBeenCalledOnce();
  expect(playPictureName(olla)).toBe('recorded');
  expect(first.pause).toHaveBeenCalled(); expect(first.removeAttribute).toHaveBeenCalledWith('src');
  const second = FakeAudio.instances[1]!;
  expect(second.src).toBe('/test-approved/olla.mp3');
  stopPicturePlayback(); expect(second.pause).toHaveBeenCalled(); expect(second.src).toBe('');
});
it('obeys the current recorded-only policy and never substitutes TTS or silent.mp3', () => {
  expect(playPictureName(oso)).toBe('missing-recording');
  expect(FakeAudio.instances).toHaveLength(0); expect(speech.speak).not.toHaveBeenCalled();
});
it('supports missing-recording TTS only when the audio policy explicitly permits it; taps never queue speech', () => {
  (AUDIO_POLICY as { allowTts: boolean }).allowTts = true; // Future approved-policy fixture, not production configuration.
  expect(playPictureName(oso)).toBe('tts'); expect(playPictureName(olla)).toBe('tts');
  expect(speech.cancel).toHaveBeenCalled();
  expect(speech.speak.mock.calls.map(([utterance]) => utterance.text.toLowerCase())).toEqual(['oso', 'olla']);
});
it('Gretel interrupts a recording and a picture invalidates delayed Gretel speech', async () => {
  vi.mocked(approvedPictureRecording).mockReturnValue('/test-approved/oso.mp3');
  playPictureName(oso);
  const recording = FakeAudio.instances[0]!;
  const pending = speakAsGretel('Una pista');
  expect(recording.pause).toHaveBeenCalled();
  playPictureName(olla);
  await pending;
  expect(speech.speak).not.toHaveBeenCalled();
});
it('both existing mute controls stop picture playback and prevent a new recording', () => {
  vi.mocked(approvedPictureRecording).mockReturnValue('/test-approved/oso.mp3');
  playPictureName(oso); setGretelVoiceMuted(true);
  expect(FakeAudio.instances[0]!.pause).toHaveBeenCalled(); expect(playPictureName(olla)).toBe('muted');
  setGretelVoiceMuted(false); playPictureName(oso); audioEngine.setMuted(true);
  expect(FakeAudio.instances[1]!.pause).toHaveBeenCalled(); expect(playPictureName(olla)).toBe('muted');
});
it('navigation and listener cleanup stop playback; a late reveal of the same page does not', () => {
  vi.mocked(approvedPictureRecording).mockReturnValue('/test-approved/oso.mp3');
  uninstall = installPictureAudio(); playPictureName(oso);
  window.dispatchEvent(new CustomEvent('gretel:bus', { detail: { type: 'page:revealed', pageNumber: 2 } }));
  expect(FakeAudio.instances[0]!.pause).not.toHaveBeenCalled();
  window.dispatchEvent(new CustomEvent('gretel:bus', { detail: { type: 'page-turn:start' } }));
  expect(FakeAudio.instances[0]!.pause).toHaveBeenCalled();
  playPictureName(oso); uninstall(); uninstall = undefined; expect(FakeAudio.instances[1]!.pause).toHaveBeenCalled();
});
it('one click still selects an answer; keyboard activation hears the same picture without a second gesture', () => {
  uninstall = installPictureAudio(); vi.mocked(approvedPictureRecording).mockReturnValue('/test-approved/oso.mp3');
  const select = vi.fn();
  render(<button onClick={select}>Answer<LivingIllustration src={oso.images[0]!} alt="oso" /></button>);
  fireEvent.click(screen.getByRole('img', { name: 'oso' }));
  expect(select).toHaveBeenCalledOnce(); expect(FakeAudio.instances).toHaveLength(1);
  fireEvent.click(screen.getByText('Answer'), { detail: 0 });
  expect(select).toHaveBeenCalledTimes(2); expect(FakeAudio.instances).toHaveLength(2);
});
it('static instructional pictures are keyboard accessible and legitimate dragging is preserved', () => {
  uninstall = installPictureAudio(); vi.mocked(approvedPictureRecording).mockReturnValue('/test-approved/oso.mp3');
  render(<LivingIllustration src={oso.images[0]!} alt="oso" />);
  fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
  expect(FakeAudio.instances).toHaveLength(1);
  const picture = screen.getByRole('img', { name: 'oso' });
  fireEvent.pointerDown(picture, { clientX: 1, clientY: 1 }); fireEvent.pointerMove(picture, { clientX: 30, clientY: 30 });
  fireEvent.click(picture, { detail: 1 });
  expect(FakeAudio.instances).toHaveLength(1);
});
it('picture exploration emits no progress/help/completion callbacks or learning bus events', () => {
  uninstall = installPictureAudio(); vi.mocked(approvedPictureRecording).mockReturnValue('/test-approved/oso.mp3');
  const bus = vi.fn(), complete = vi.fn(), audioPlayed = vi.fn(), result = vi.fn();
  window.addEventListener('gretel:bus', bus);
  const before = JSON.stringify(localStorage);
  render(<TapToHear objects={[{ id: 'picture', src: oso.images[0], alt: 'oso', box: { xPct: 0, yPct: 0, wPct: 10, hPct: 10 } }]} onComplete={complete} onAudioPlayed={audioPlayed} onResult={result} reducedMotion />);
  fireEvent.click(screen.getByRole('button'));
  expect(complete).not.toHaveBeenCalled(); expect(audioPlayed).not.toHaveBeenCalled(); expect(result).not.toHaveBeenCalled();
  expect(bus).not.toHaveBeenCalled(); expect(JSON.stringify(localStorage)).toBe(before);
  window.removeEventListener('gretel:bus', bus);
});
