import { FinalPageBackground } from "./FinalPageBackground";
import { workbookBackground } from "@/lib/final-backgrounds";
import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { PageRegion } from "@/lib/book-faithful";
import { InteractivePictureGrid, InteractiveVowelPickOne } from "./InteractivePageExercises";
import "@/styles/digital-workbook.css";

export const DIGITAL_PAGE_WIDTH = 612;
export const DIGITAL_PAGE_HEIGHT = 792;

function exactBox(region: PageRegion): region is PageRegion & Required<Pick<PageRegion, "x" | "y" | "width" | "height">> {
  return [region.x, region.y, region.width, region.height].every(
    (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1,
  ) && (region.x ?? 1) + (region.width ?? 1) <= 1.000001
    && (region.y ?? 1) + (region.height ?? 1) <= 1.000001;
}

function position(region: PageRegion): CSSProperties {
  return {
    position: "absolute",
    left: `${(region.x ?? 0) * DIGITAL_PAGE_WIDTH}px`,
    top: `${(region.y ?? 0) * DIGITAL_PAGE_HEIGHT}px`,
    width: `${(region.width ?? 0) * DIGITAL_PAGE_WIDTH}px`,
    height: `${(region.height ?? 0) * DIGITAL_PAGE_HEIGHT}px`,
  };
}

function FixedRegion({ region, interactive }: { region: PageRegion; interactive: boolean }) {
  switch (region.regionType) {
    case "instruction":
      return (
        <div className="digital-region digital-region--instruction" style={position(region)}>
          {region.label && <strong>{region.label}</strong>}
          <span>{region.text}</span>
        </div>
      );
    case "vowel-pick-one":
      return (
        <div className="digital-region digital-region--grid" style={position(region)}>
          {interactive ? (
            <InteractiveVowelPickOne region={region} accent="#008b82" precise lessonId="1" />
          ) : (
            <div className="digital-static-grid">
              {(region.vowelRows ?? []).map((row) => (
                <div className="digital-static-grid__row" key={row.letter}>
                  <span className="digital-static-grid__letter">{row.letter}</span>
                  {row.cells.map((cell, index) => (
                    <img key={index} src={cell.illustrationSrc} alt={cell.caption ?? ""} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "picture-grid":
      return (
        <div className="digital-region digital-region--grid" style={position(region)}>
          {interactive ? (
            <InteractivePictureGrid region={region} accent="#008b82" precise lessonId="1" />
          ) : (
            <div className="digital-static-picture-grid" style={{ gridTemplateColumns: region.gridColumnFracs?.map((fraction) => `${fraction * 100}%`).join(" "), gridTemplateRows: region.gridRowFracs?.map((fraction) => `${fraction * 100}%`).join(" ") }}>
              {(region.cells ?? []).map((cell, index) => <img key={index} src={cell.illustrationSrc} alt={cell.caption ?? ""} />)}
            </div>
          )}
        </div>
      );
    case "footer":
    case "page-number":
      return <span className={`digital-region digital-region--${region.regionType}`} style={{ ...position(region), justifyContent: region.textAlign === "start" ? "flex-start" : "flex-end" }}>{region.text}</span>;
    default:
      return <div className="digital-region" style={position(region)}>{region.text}</div>;
  }
}

/** A logical 612 x 792 canvas: only the whole canvas scales with the viewport. */
export function FixedLayoutPage({
  pageNumber,
  regions,
  interactive = false,
}: {
  pageNumber: number;
  regions: PageRegion[];
  interactive?: boolean;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const node = holder.current;
    if (!node) return;
    const measure = () => setScale(node.clientWidth / DIGITAL_PAGE_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!regions.length || !regions.every(exactBox)) return null;

  return (
    <div ref={holder} className="digital-page-frame" data-digital-page={pageNumber}>
      <div
        className="digital-page-canvas"
        style={{ transform: `scale(${scale})` }}
        aria-label={`Página digital ${pageNumber}`}
      >
        <FinalPageBackground asset={workbookBackground(pageNumber)} />
        {[...regions].sort((a, b) => a.order - b.order).map((region) => (
          <FixedRegion key={region.id} region={region} interactive={interactive} />
        ))}
      </div>
    </div>
  );
}
