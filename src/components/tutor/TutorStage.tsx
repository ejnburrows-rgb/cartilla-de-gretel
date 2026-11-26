import type { ReactNode } from "react";
import "./tutor-stage.css";

export interface TutorStageProps {
  gretel: ReactNode;
  card: ReactNode;
  mic: ReactNode;
  status?: ReactNode;
  controls?: ReactNode;
}

/**
 * Legacy simple stage preserved for backwards compatibility with any direct
 * callers; `/tutor/$n` now uses `TutorCallShell` for the 4-mode persistent
 * video-call experience.
 */
export function TutorStage({ gretel, card, mic, status, controls }: TutorStageProps) {
  return (
    <main data-tutor-stage="" className="tutor-stage">
      <nav className="tutor-controls" aria-label="Controles del tutor">
        {controls}
      </nav>
      <div data-tutor-stage-gretel="" className="tutor-figure">
        {gretel}
      </div>
      <div className="tutor-learning">
        {card}
        <div className="tutor-response">
          {mic}
          {status}
        </div>
      </div>
    </main>
  );
}

export default TutorStage;
