/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import geometry from '@/data/workbook-middle-source-geometry.json';
import layouts from '@/data/page-layouts.json';

type Page = {
  wavePath: string; scanSha256: string;
  models?: { layers: { d: string }[] }[];
  rules?: unknown[]; drawing?: { d: string; width: number; height: number };
  titlePath?: string; story?: { left: number; top: number; leading: number };
  vocabulary?: { text: string; left: number; top: number; fontSize: number; scaleX: number; sourceBox: number[] }[];
};
const pages = geometry.pages as Record<string, Page>;

describe('Lane B source geometry provenance and completeness', () => {
  it('binds all 44 shapes to their actual original scan bytes', () => {
    expect(Object.keys(pages).map(Number)).toEqual(Array.from({length:44},(_,i)=>i+23));
    for (let n=23;n<=66;n++) {
      const scan=readFileSync(new URL(`../../../public/cartilla/art/source/workbook/page-${String(n).padStart(3,'0')}.jpg`,import.meta.url));
      expect(createHash('sha256').update(scan).digest('hex')).toBe(pages[n].scanSha256);
      expect(pages[n].wavePath).toMatch(/^M.+ Z$/);
    }
  });
  it('has original models, all six rules, and a real drawing outline on every writing page', () => {
    for (let n=23;n<=63;n+=4) {
      expect(pages[n].rules).toHaveLength(6);
      expect(pages[n].models).toHaveLength(2);
      expect(pages[n].models![0].layers.some(layer=>layer.d.length>100)).toBe(true);
      expect(pages[n].drawing!.d.length).toBeGreaterThan(100);
      expect(pages[n].drawing!.width).toBeGreaterThan(70);
      expect(pages[n].drawing!.height).toBeGreaterThan(25);
    }
  });
  it('preserves every reading word and requires measured titles and story positions', () => {
    let count=0;
    for (let n=25;n<=65;n+=4) {
      const page=pages[n];
      const expected=(layouts.pages as Record<string,{regions:{regionType:string;text?:string}[]}>)[n].regions.find(region=>region.regionType==='vocab-grid')!.text!.split('·').map(word=>word.trim());
      expect(page.vocabulary!.map(word=>word.text)).toEqual(expected);
      expect(page.titlePath!.length).toBeGreaterThan(100);
      expect(page.story!.top).toBeGreaterThan(50);
      expect(page.story!.leading).toBeGreaterThan(3);
      for(const word of page.vocabulary!) {
        expect(word.left).toBeGreaterThan(0);expect(word.left).toBeLessThan(85);
        expect(word.top).toBeGreaterThan(20);expect(word.top).toBeLessThan(58);
        expect(word.fontSize).toBeGreaterThan(1);expect(word.fontSize).toBeLessThan(6);
        expect(word.scaleX).toBeGreaterThan(.5);expect(word.scaleX).toBeLessThan(1.6);
        expect(word.sourceBox).toHaveLength(4);
      }
      count+=page.vocabulary!.length;
    }
    expect(count).toBe(168);
  });
});
