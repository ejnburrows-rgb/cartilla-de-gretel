/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InteractivePictureGrid } from '../InteractivePageExercises';
import { getPageLayout } from '@/lib/book-faithful';
vi.mock('@/lib/piano-audio', () => ({ playCorrectChord:vi.fn(), playWrongBuzz:vi.fn() }));
afterEach(cleanup);
describe('printed7 ordered picture screens', () => {
 it('shows all16original pictures as8plus8, retaining original order and page identity', () => {
  const region = getPageLayout(7)!.find(r=>r.id === 'p7-grid')!;
  const view=render(<InteractivePictureGrid region={region} accent="#099" lessonId="3" mark="x" pageSize={8}/>);
  const pictures=()=>[...view.container.querySelectorAll('.fp-ix-cell')].map(b=>b.getAttribute('aria-label'));
  expect(pictures()).toEqual(region.cells!.slice(0,8).map(c=>c.caption));
  fireEvent.click(view.getByRole('button',{name:'Dibujos 9-16'}));
  expect(pictures()).toEqual(region.cells!.slice(8).map(c=>c.caption));
  fireEvent.click(view.getByRole('button',{name:'Dibujos 1-8'}));
  expect(pictures()).toEqual(region.cells!.slice(0,8).map(c=>c.caption));
 });
});
