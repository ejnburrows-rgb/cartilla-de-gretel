import { pendingRecordingSlotsForPage } from '@/lib/pending-recording-slots';
import { reportRecordedSpeechStatus } from '@/lib/recorded-speech';

/** An honest, keyboard-reachable missing-file state, not a playable or synthesized voice. */
export function PendingRecordingSlots({ pageNumber }: { pageNumber: number }) {
  return <>{pendingRecordingSlotsForPage(pageNumber).map(slot => (
    <button key={slot.key} type="button" aria-disabled="true"
      aria-label={`Grabación pendiente. Lámina ${pageNumber}`}
      className="min-h-11 rounded-md px-2 text-sm text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
      data-recording-key={slot.key} data-recording-src={slot.src} data-recording-page={pageNumber}
      onClick={() => reportRecordedSpeechStatus('missing-recording', slot.key, slot.src, 'native-slot')}>
      Grabación pendiente
    </button>
  ))}</>;
}
