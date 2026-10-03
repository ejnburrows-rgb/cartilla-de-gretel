import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { render, cleanup } from "@testing-library/react";
import delivered from "@/data/final-backgrounds.json";
import { workbookBackground, flipchartBackground } from "../final-backgrounds";
import { PageFrame } from "@/components/cartilla/PageFrame";
import { FlipchartNativeBoard } from "@/components/cartilla/FlipchartNativeBoard";
import flipchart from "@/data/teacher-flipchart.json";
it("all 148 delivered registry assets exist with unchanged manifest bytes", () => {
 const assets=[...Object.values(delivered.workbook),...Object.values(delivered.flipchart)];
 expect(assets).toHaveLength(148);expect(new Set(assets.map(a=>a.src)).size).toBe(148);
 for(const a of assets){const bytes=readFileSync(`public${a.src}`);expect(createHash('sha256').update(bytes).digest('hex')).toBe(a.sha256);expect(bytes.subarray(1,4).toString()).toBe('PNG');}
});
it("Workbook excludes 86–87 without inheriting the preceding image",()=>{
 expect(workbookBackground(86)).toBeUndefined();expect(workbookBackground(87)).toBeUndefined();
 const view=render(<PageFrame pageNumber={85}>Work</PageFrame>);expect(view.container.querySelector('.final-page-background')?.getAttribute('data-background-printed-page')).toBe('85');
 view.rerender(<PageFrame pageNumber={86}>Work</PageFrame>);expect(view.container.querySelector('.final-page-background')).toBeNull();cleanup();
});
it("Flip Chart covers every printed page, uses PDF sheets and excludes front matter",()=>{
 expect(flipchartBackground(1)).toBeUndefined();expect(flipchartBackground(2)).toBeUndefined();
 for(let printed=1;printed<=60;printed++)expect(flipchartBackground(printed+2)?.printedPage).toBe(printed);
 expect(Object.values(delivered.flipchart)).toHaveLength(60);
});
it("active Flip Chart board gets its own background without replacing foreground",()=>{
 const page=flipchart.pages.find(p=>p.flipchartPage===3)!;const view=render(<FlipchartNativeBoard page={page}/>);
 const bg=view.container.querySelector('.final-page-background');expect(bg?.getAttribute('data-background-printed-page')).toBe('1');expect(bg?.getAttribute('data-background-pdf-sheet')).toBe('3');expect(view.container.querySelector('.fc-native-board__page')).toBeTruthy();cleanup();
});
