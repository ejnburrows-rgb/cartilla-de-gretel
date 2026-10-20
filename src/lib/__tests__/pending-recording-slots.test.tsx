import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { pendingRecordingSlotsForPage } from '../pending-recording-slots';
import { PendingRecordingSlots } from '@/components/audio/PendingRecordingSlots';
import slots from '@/content/picture-recording-slots.json';
afterEach(cleanup);
it('binds all 36 native scene slots to exact source pages, never guesses the blink page', () => {
 const bound = Array.from({length:62}, (_,i)=>pendingRecordingSlotsForPage(i+1)).flat();
 expect(bound).toHaveLength(36);
 expect(new Set(bound.map(slot=>slot.key)).size).toBe(36);
 expect(bound.some(slot=>slot.key === 'oso (parpadeo)')).toBe(false);
 for (const slot of bound) expect(slots.pending.find(entry=>entry.key===slot.key)?.sourceReference).toContain(`Flip Chart ${slot.pageNumber} /`);
});
it('provides a focusable honest pending control without playing audio or uttering metadata', () => {
 const audio = vi.fn(); vi.stubGlobal('Audio',audio); const event = vi.fn();
 window.addEventListener('cartilla:recorded-speech-status', event, { once:true });
 render(<PendingRecordingSlots pageNumber={50} />);
 const control = screen.getByRole('button', {name:'Grabación pendiente. Lámina 50'});
 expect(control.getAttribute('aria-disabled')).toBe('true');
 expect(control.getAttribute('data-recording-src')).toBe('/audio/voz/vocabulario/a-la-fiesta-scene.mp3');
 fireEvent.click(control);
 expect(event.mock.calls[0]![0].detail).toEqual({ source:'native-slot',status:'missing-recording',key:'a la fiesta scene',src:'/audio/voz/vocabulario/a-la-fiesta-scene.mp3' });
 expect(audio).not.toHaveBeenCalled(); vi.unstubAllGlobals();
});
