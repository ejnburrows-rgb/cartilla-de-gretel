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
  readingWords?: {text:string;left:number;top:number;scaleX:number}[][];
  staticRegions?: { region:string;layers:{d:string}[] }[];
  circles?: Record<string,{text:string;left:number;top:number;scaleX:number}[]>;
  sentenceRules?: unknown[];
  fills?: {wordBox:{text:string;fontSize:number};parts:{text:string;scaleX:number;fontSize:number}[];choices:{text:string;scaleX:number}[];blank:{left:number;top:number;width:number;height:number}}[];
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
  it('measures all 330 circle words in their original region and reading order', () => {
    let count=0;
    for(let n=24;n<=64;n+=4) {
      const regions=layouts.pages[String(n) as keyof typeof layouts.pages].regions;
      for(const region of regions.filter(r=>r.regionType==='syllable-match')) {
        const expected=('matchRows' in region ? region.matchRows : [])!.flat().map(e=>e.word);
        const actual=pages[n].circles![region.id];
        expect(actual.map(word=>word.text)).toEqual(expected);
        for(const word of actual) {
          expect(word.left).toBeGreaterThan(30);expect(word.left).toBeLessThan(95);
          expect(word.top).toBeGreaterThan(10);expect(word.top).toBeLessThan(94);
          expect(word.scaleX).toBeGreaterThan(.4);expect(word.scaleX).toBeLessThan(1.7);
        }
        count+=actual.length;
      }
    }
    expect(count).toBe(330);
  });
  it('preserves all 66 completion items and their answer order in measured drop fields', () => {
    let count=0;
    for(let n=26;n<=66;n+=4) {
      const regions=layouts.pages[String(n) as keyof typeof layouts.pages].regions;
      const region=regions.find(r=>r.regionType==='fill-in-blank')!;
      const items=('fillItems' in region ? region.fillItems : [])!;
      expect(pages[n].fills).toHaveLength(6);
      expect(pages[n].sentenceRules).toHaveLength(6);
      pages[n].fills!.forEach((item,i)=>{
        expect(item.wordBox.text).toBe(items[i].wordBox);
        expect(item.wordBox.fontSize).toBeGreaterThan(2);expect(item.wordBox.fontSize).toBeLessThan(4);
        for(const part of item.parts) {expect(part.scaleX).toBeGreaterThan(.5);expect(part.scaleX).toBeLessThan(1.6);}
        expect(item.choices.map(choice=>choice.text)).toEqual(items[i].choices.map(choice=>choice.text));
        expect(item.blank.left).toBeGreaterThan(12);expect(item.blank.left+item.blank.width).toBeLessThan(99);
        expect(item.blank.width).toBeGreaterThan(3);expect(item.blank.width).toBeLessThan(25);
        expect(item.blank.height).toBeGreaterThan(2);
        for(const choice of item.choices) {expect(choice.scaleX).toBeGreaterThan(.4);expect(choice.scaleX).toBeLessThan(1.7);}
      });
      count+=items.length;
    }
    expect(count).toBe(66);
  });
  it('retains every original instruction as visible source outlines and semantic text',()=>{
    let count=0;
    for(let n=23;n<=66;n++) {
      const regions=layouts.pages[String(n) as keyof typeof layouts.pages].regions;
      for(const region of regions.filter(r=>r.regionType==='instruction')) {
        const measured=pages[n].staticRegions!.find(r=>r.region===region.id);
        expect(measured!.layers.some(layer=>layer.d.length>100)).toBe(true);count++;
      }
    }
    expect(count).toBe(55);
  });

  it('keeps every story word on its measured source line without replacing canonical text',()=>{
    let lines=0;
    for(let n=25;n<=65;n+=4) {
      const regions=layouts.pages[String(n) as keyof typeof layouts.pages].regions;
      const region=regions.find(r=>r.regionType==='reading-sentences')!;
      const sentences=('sentences' in region ? region.sentences : [])!;
      expect(pages[n].readingWords!.map(line=>line.map(word=>word.text).join(' '))).toEqual(sentences);
      for(const line of pages[n].readingWords!) {
        for(const word of line) {
          // Page 29 deliberately starts near the cropped left scan edge.
          expect(word.left).toBeGreaterThan(0);expect(word.left).toBeLessThan(90);
          expect(word.top).toBeGreaterThan(55);expect(word.top).toBeLessThan(94);
          expect(word.scaleX).toBeGreaterThan(.4);expect(word.scaleX).toBeLessThan(1.7);
        }
        lines++;
      }
    }
    expect(lines).toBe(70);
  });

});
