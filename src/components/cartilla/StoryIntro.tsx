import { useState, useRef, useEffect } from "react";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import { ChevronRight, SkipForward } from "lucide-react";

export interface StoryIntroProps {
  lessonNumber: number;
  storyVideoUrl?: string | null;
  storyLines: string[];
  characterName?: string;
  onComplete: (skipped?: boolean) => void;
}

export function StoryIntro({
  lessonNumber,
  storyVideoUrl,
  storyLines,
  characterName,
  onComplete,
}: StoryIntroProps) {
  const [videoError, setVideoError] = useState(false);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSkip = () => {
    onComplete(true);
  };

  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        onComplete(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onComplete]);

  // Video Mode: sync subtitles
  useEffect(() => {
    if (!videoError && storyVideoUrl && videoRef.current) {
      const vid = videoRef.current;
      const updateSubtitle = () => {
        const duration = vid.duration || 1;
        // Simple heuristic: divide video equally among lines
        const timePerLine = duration / Math.max(storyLines.length, 1);
        const idx = Math.floor(vid.currentTime / timePerLine);
        setCurrentLineIdx(Math.min(idx, storyLines.length - 1));
      };
      vid.addEventListener("timeupdate", updateSubtitle);
      return () => vid.removeEventListener("timeupdate", updateSubtitle);
    }
  }, [videoError, storyVideoUrl, storyLines.length]);

  const handleVideoEnded = () => {
    setIsFinished(true);
  };

  const nextTextLine = () => {
    if (currentLineIdx < storyLines.length - 1) {
      setCurrentLineIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const showVideo = !!storyVideoUrl && !videoError;

  return (
    <div className="w-full relative bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#e6ccb2] rounded-[2rem] p-6 sm:p-8 shadow-inner border-[8px] border-[#bc6c25] flex flex-col items-center justify-center min-h-[60vh] overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-30 flex items-center gap-1 px-4 py-2 bg-white/70 hover:bg-white rounded-full text-sm font-bold text-stone-700 transition shadow-sm border border-stone-200"
      >
        Saltar <SkipForward className="w-4 h-4" />
      </button>

      {showVideo ? (
        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black mb-6 border-4 border-[#8B4513]/20">
          <video
            ref={videoRef}
            src={storyVideoUrl}
            autoPlay
            playsInline
            onError={() => setVideoError(true)}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full z-10">
          <div
            key={currentLineIdx}
            className="text-3xl sm:text-5xl font-black text-center text-[#603813] leading-snug max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {storyLines[currentLineIdx]}
          </div>
        </div>
      )}

      {/* Subtitles for Video Mode */}
      {showVideo && (
        <div className="absolute bottom-8 left-0 right-0 px-8 pointer-events-none z-20 flex justify-center">
          <div className="bg-black/70 text-white px-6 py-3 rounded-2xl text-xl sm:text-3xl font-bold text-center max-w-3xl backdrop-blur-md animate-in fade-in">
            {storyLines[currentLineIdx]}
          </div>
        </div>
      )}

      {/* Controls for Text Mode */}
      {!showVideo && !isFinished && (
        <button
          onClick={nextTextLine}
          className="mt-8 z-20 flex items-center gap-2 px-8 py-4 bg-[#bc6c25] hover:bg-[#8B4513] text-white rounded-2xl text-2xl font-bold transition shadow-xl hover:-translate-y-1 active:translate-y-0"
        >
          {currentLineIdx < storyLines.length - 1 ? "Siguiente" : "Comenzar lección"}
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Mascot Overlay */}
      <div className="absolute bottom-2 right-4 z-20 pointer-events-none">
        <GretelMascot
          pose={isFinished ? "celebrate" : "welcome"}
          className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl"
        />
      </div>
    </div>
  );
}
