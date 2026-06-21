import React, { useState } from "react";
import { getInteractionsForPage } from "@/lib/workbook-interactions";
import { gretelEvent } from "@/lib/gretel-bus";
import { Check } from "lucide-react";

export function InteractivePageOverlay({ lessonNumber, pageNumber }: { lessonNumber?: number; pageNumber: number }) {
  const [tappedTargets, setTappedTargets] = useState<Record<string, boolean>>({});

  if (!lessonNumber) return null;

  const interactions = getInteractionsForPage(lessonNumber, pageNumber);
  
  if (interactions.length === 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {interactions.map((interaction) => (
        <React.Fragment key={interaction.id}>
          {interaction.targets.map((target) => {
            // Only render targets that have verified coordinates
            if (!target.coordinatesVerified || target.xPercent === undefined || target.yPercent === undefined) {
              return null;
            }

            const isTapped = tappedTargets[target.id];

            return (
              <div
                key={target.id}
                className={`absolute border-[3px] border-dashed pointer-events-auto cursor-pointer transition-all duration-500 hover:scale-110 rounded-xl shadow-lg flex items-center justify-center ${
                  isTapped 
                    ? "border-emerald-500 bg-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    : "border-orange-500/70 bg-orange-500/20 hover:bg-orange-500/40 hover:border-orange-500 animate-pulse"
                }`}
                style={{
                  left: `${target.xPercent}%`,
                  top: `${target.yPercent}%`,
                  width: `${target.widthPercent ?? 10}%`,
                  height: `${target.heightPercent ?? 10}%`,
                }}
                title={target.label}
                onClick={() => {
                  if (!isTapped) {
                    setTappedTargets((prev) => ({ ...prev, [target.id]: true }));
                    gretelEvent("answer:correct");
                  }
                }}
              >
                {isTapped && (
                  <Check className="w-full h-full text-white drop-shadow-md animate-in zoom-in spin-in-12 duration-500 p-2" />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
