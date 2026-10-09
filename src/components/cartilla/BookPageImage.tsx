import React, { useState, useEffect } from "react";
import { Shimmer } from "@/components/feel/Shimmer";

interface BookPageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  fallbackSrcs?: string[];
}

export function BookPageImage({
  src,
  fallbackSrcs = [],
  alt,
  className = "",
  wrapperClassName = "",
  ...props
}: BookPageImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setFallbackIndex(-1);
    setHasError(false);
    setIsLoaded(false);
  }

  const currentSrc = fallbackIndex === -1 ? src : fallbackSrcs[fallbackIndex];

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-surface rounded-sm drop-shadow-md border border-border ${wrapperClassName}`}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-stone-100/50">
          <Shimmer />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#fff8e7] text-stone-500">
          <span className="text-sm font-bold">Imagen no disponible</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-contain relative z-10 transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          draggable={false}
          loading="lazy"
          onLoad={(e) => {
            setIsLoaded(true);
            props.onLoad?.(e);
          }}
          onError={(e) => {
            if (fallbackIndex + 1 < fallbackSrcs.length) {
              const nextIdx = fallbackIndex + 1;
              setFallbackIndex(nextIdx);
            } else {
              setHasError(true);
              props.onError?.(e);
            }
          }}
          {...props}
        />
      )}
    </div>
  );
}
