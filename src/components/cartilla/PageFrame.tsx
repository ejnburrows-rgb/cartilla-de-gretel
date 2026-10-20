import { FinalPageBackground } from "./FinalPageBackground";
import { workbookBackground } from "@/lib/final-backgrounds";
import React, { type ReactNode } from "react";
import sourceGeometry from "@/data/workbook-middle-source-geometry.json";
import "@/styles/faithful-page.css";

interface PageFrameProps {
  pageNumber?: number;
  lessonNumber?: number;
  children: ReactNode;
  className?: string;
  garden?: boolean;
  gardenBg?: string;
}

interface SourcePageGeometry {
  wavePath: string;
  waveColor: string;
  diamond: { x: number; y: number; size: number };
  rules?: { d: string; dashed: boolean; y: number }[];
  titlePath?: string;
  staticRegions?: {region:string;layers:{fill:string;d:string;stroke?:string;strokeWidth?:number}[]}[];
  sentenceRules?: { d: string; dashed: boolean; y: number; left:number;right:number }[];
  story?: { left: number; top: number; leading: number };
  drawing?: { d: string; color: string; left: number; top: number; width: number; height: number };
  models?: { region: string; layers: { fill: string; d: string }[] }[];
}

function WavySidebar({ source }: { source?: SourcePageGeometry }) {
  if (source) return (
    <svg viewBox="0 0 935 1210" preserveAspectRatio="none" aria-hidden="true">
      <path d={source.wavePath} fill={source.waveColor} />
      {source.rules?.map((rule, index) => <path key={index} d={rule.d} fill="none" stroke={rule.dashed ? "#81a99c" : "#3d443b"} strokeWidth="1.5" strokeDasharray={rule.dashed ? "14 8" : undefined} />)}
      {source.staticRegions?.map(region => <g key={region.region} data-source-print={region.region}>{region.layers.map((layer,index)=><path key={index} d={layer.d} fill={layer.fill} stroke={layer.stroke} strokeWidth={layer.strokeWidth}/>)}</g>)}
      {source.sentenceRules?.map((rule,index)=><path key={`sentence-${index}`} d={rule.d} fill="none" stroke={rule.dashed ? "#81a99c" : "#3d443b"} strokeWidth="1.5" strokeDasharray={rule.dashed ? "14 8" : undefined}/>)}
      {source.titlePath && <path d={source.titlePath} fill="#343a31" />}
      {source.drawing && <path d={source.drawing.d} fill={source.drawing.color} />}
      {source.models?.map((model) => <g key={model.region} data-source-model={model.region}>{model.layers.map((layer, index) => <path key={index} fill={layer.fill} d={layer.d} />)}</g>)}
    </svg>
  );
  const d =
    "M0,0 L70,0 " +
    "C40,40 100,80 70,120 C40,160 100,200 70,240 " +
    "C40,280 100,320 70,360 C40,400 100,440 70,480 " +
    "C40,520 100,560 70,600 C40,640 100,680 70,720 " +
    "C40,760 100,800 70,840 C40,880 100,920 70,960 " +
    "C40,1000 100,1040 70,1080 L0,1080 Z";
  return (
    <svg viewBox="0 0 100 1080" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function PageFrame({ pageNumber, lessonNumber, children, className, garden, gardenBg }: PageFrameProps) {
  const edgeClass = typeof pageNumber === "number" && pageNumber % 2 === 1 ? "faithful-page--edge-right" : "faithful-page--edge-left";
  const classes = ["faithful-page", edgeClass, garden ? "faithful-page--garden" : "", className ?? ""].filter(Boolean).join(" ");
  const source = className?.includes("faithful-page--lane-b") && pageNumber
    ? (sourceGeometry.pages as Record<string, SourcePageGeometry>)[String(pageNumber)]
    : undefined;
  const style = {
    ...(garden && gardenBg ? { "--garden-page-bg": `url('${gardenBg}')` } : {}),
    ...(source?.sentenceRules ? {
      "--wb-sentence-left": `${source.sentenceRules[0].left}%`,
      "--wb-sentence-width": `${source.sentenceRules[0].right-source.sentenceRules[0].left}%`,
      "--wb-sentence-top": `${(source.sentenceRules[0].y-30)/1210*100}%`,
      "--wb-sentence-height": `${(source.sentenceRules[5].y-source.sentenceRules[0].y+35)/1210*100}%`,
      "--wb-sentence-leading": `${(source.sentenceRules[1].y-source.sentenceRules[0].y)/935*100}cqw`,
    } : {}),
    ...(source?.story ? {
      "--wb-story-left": `${source.story.left}%`,
      "--wb-story-top": `${source.story.top}%`,
      "--wb-story-leading": `${source.story.leading}cqw`,
    } : {}),
    ...(source?.drawing ? {
      "--wb-drawing-left": `${source.drawing.left}%`,
      "--wb-drawing-top": `${source.drawing.top}%`,
      "--wb-drawing-width": `${source.drawing.width}%`,
      "--wb-drawing-height": `${source.drawing.height}%`,
    } : {}),
    ...(source?.rules ? {
      "--wb-writing-upper-top": `${source.rules[0].y / 1210 * 100}%`,
      "--wb-writing-upper-height": `${(source.rules[2].y - source.rules[0].y) / 1210 * 100}%`,
      "--wb-writing-lower-top": `${source.rules[3].y / 1210 * 100}%`,
      "--wb-writing-lower-height": `${(source.rules[5].y - source.rules[3].y) / 1210 * 100}%`,
    } : {}),
  } as React.CSSProperties;

  return (
    <div className={classes} style={style} data-workbook-page={pageNumber}>
      <FinalPageBackground asset={typeof pageNumber === "number" ? workbookBackground(pageNumber) : undefined} />
      <div className="faithful-page__sidebar" data-source-wave={source ? "true" : undefined} style={source ? { inset: 0, width: "100%", height: "100%", transform: "none", pointerEvents: "none" } : undefined}><WavySidebar source={source} /></div>
      <div className="faithful-page__body">{children}</div>
      {typeof pageNumber === "number" && <div className="faithful-page__pagenum" style={source ? { left: `${source.diamond.x}%`, top: `${source.diamond.y}%`, right: "auto", bottom: "auto", width: `${source.diamond.size}cqw`, height: `${source.diamond.size}cqw`, minWidth: 0, minHeight: 0, transform: "translate(-50%, -50%) rotate(45deg)" } : undefined} aria-label={`Página ${pageNumber}`}><span>{pageNumber}</span></div>}
      {typeof lessonNumber === "number" && <div className="faithful-page__lesson">Lección {lessonNumber}</div>}
    </div>
  );
}
