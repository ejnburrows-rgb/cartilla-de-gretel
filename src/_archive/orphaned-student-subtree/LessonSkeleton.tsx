import React from "react";

export default function LessonSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, var(--color-surface-offset, #e5e5e5) 25%, var(--color-surface-dynamic, #f0f0f0) 50%, var(--color-surface-offset, #e5e5e5) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer {
            animation: none;
            background: var(--color-surface-offset, #e5e5e5);
          }
        }
      `}</style>
      <div className="flex-1 px-4 pt-4 pb-28 max-w-3xl w-full mx-auto space-y-6">
        {/* Title bar area */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-4 w-24 rounded-full skeleton-shimmer mb-3"></div>
          <div className="h-10 sm:h-12 w-64 sm:w-80 rounded-full skeleton-shimmer mt-1"></div>
          <div className="h-5 w-48 rounded-full skeleton-shimmer mt-4"></div>
        </div>

        {/* Letter display box (square card) */}
        <div className="flex justify-center mb-8">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl skeleton-shimmer"></div>
        </div>

        {/* Vocabulary pills row */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="h-10 w-20 rounded-2xl skeleton-shimmer"></div>
          <div className="h-10 w-24 rounded-2xl skeleton-shimmer"></div>
          <div className="h-10 w-16 rounded-2xl skeleton-shimmer"></div>
          <div className="h-10 w-28 rounded-2xl skeleton-shimmer"></div>
        </div>

        {/* Poem lines */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="h-4 w-4/5 rounded-full skeleton-shimmer"></div>
          <div className="h-4 w-3/5 rounded-full skeleton-shimmer"></div>
          <div className="h-4 w-[70%] rounded-full skeleton-shimmer"></div>
          <div className="h-4 w-2/5 rounded-full skeleton-shimmer"></div>
        </div>

        {/* Exercise placeholder */}
        <div className="w-full h-80 rounded-[2rem] skeleton-shimmer"></div>
      </div>
    </>
  );
}
