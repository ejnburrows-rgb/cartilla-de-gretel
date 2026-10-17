import { describe, expect, it } from 'vitest';
import { enhanceLivingArtImage } from '../living-art-runtime';

describe('source-aware living art policy', () => {
  it('leaves unapproved pictures still and never swaps the redrawn bear to old blink art', () => {
    const generic = document.createElement('img');
    generic.src = '/cartilla/art/faithful/leccion-7-m/mono.webp';
    document.body.appendChild(generic);
    enhanceLivingArtImage(generic);
    expect(generic.dataset.livingSource).toContain('mono.webp');
    expect(generic.classList.contains('living-runtime-art')).toBe(false);

    const bear = document.createElement('img');
    bear.src = '/cartilla/art/faithful/vocal-o/oso.webp';
    document.body.appendChild(bear);
    enhanceLivingArtImage(bear);
    expect(bear.dataset.trueBlinkFrame).toBeUndefined();
    expect(bear.dataset.livingProfile).toBe('breathe');
    generic.remove(); bear.remove();
  });
});
