import React from "react";
import { MouthBilabial } from "./svg/mouth-bilabial";
import { MouthAlveolar } from "./svg/mouth-alveolar";
import { MouthVelar } from "./svg/mouth-velar";
import { MouthFricative } from "./svg/mouth-fricative";
import { MouthTrill } from "./svg/mouth-trill";

type MouthKind = "bilabial" | "alveolar" | "velar" | "fricative" | "trill";

interface MouthDiagramProps {
  k: MouthKind;
  size?: number;
  className?: string;
  animated?: boolean;
}

type MouthComponent = React.FC<{
  size?: number;
  className?: string;
  animated?: boolean;
}>;

const MOUTH_MAP: Record<MouthKind, MouthComponent> = {
  bilabial: MouthBilabial,
  alveolar: MouthAlveolar,
  velar: MouthVelar,
  fricative: MouthFricative,
  trill: MouthTrill,
};

export function MouthDiagram({
  k,
  size,
  className,
  animated = false,
}: MouthDiagramProps) {
  const Component = MOUTH_MAP[k];

  if (!Component) {
    return null;
  }

  return <Component size={size} className={className} animated={animated} />;
}
