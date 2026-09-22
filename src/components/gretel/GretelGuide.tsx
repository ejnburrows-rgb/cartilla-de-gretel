import { GretelLiveAvatar } from "./GretelLiveAvatar";

interface GretelGuideProps {
  className?: string;
  bubblePosition?: "left" | "right" | "top";
}

export function GretelGuide({
  className = "",
  bubblePosition = "top",
}: GretelGuideProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <GretelLiveAvatar size="md" bubblePosition={bubblePosition} />
    </div>
  );
}
