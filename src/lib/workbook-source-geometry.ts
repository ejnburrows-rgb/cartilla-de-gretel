import type { CSSProperties } from 'react';
import measured from '@/data/workbook-middle-source-geometry.json';
export type SourceWord = { text: string; left: number; top: number; fontSize: number; scaleX: number; width?: number; height?: number; fontWeight?:number; sourceBox: number[] };
export type SourceFill = { wordBox: SourceWord; parts: SourceWord[]; choices: SourceWord[]; blank: {left:number;top:number;width:number;height:number;fontSize:number} };
export type SourceActivityGeometry = { circles?: Record<string, SourceWord[]>; readingWords?:SourceWord[][]; fills?: SourceFill[] };
export function sourceActivityGeometry(pageNumber?: number): SourceActivityGeometry | undefined {
 return pageNumber && pageNumber>=23 && pageNumber<=66 ? (measured.pages as Record<string, SourceActivityGeometry>)[pageNumber] : undefined;
}
export function sourceWordStyle(word?: SourceWord): CSSProperties | undefined {
 return word ? {position:'absolute',left:`${word.left}%`,top:`${word.top}%`,fontSize:`${word.fontSize}cqw`,lineHeight:1.3,fontWeight:word.fontWeight,transform:`scaleX(${word.scaleX})`,transformOrigin:'left top',whiteSpace:'nowrap'} : undefined;
}
