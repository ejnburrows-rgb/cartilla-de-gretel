import React, { useState } from "react";

interface BookPageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function BookPageImage({ src, alt, className = "", wrapperClassName = "", ...props }: BookPageImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-surface rounded-sm drop-shadow-md border border-border ${wrapperClassName}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-stone-200 animate-pulse" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400">
          <span className="text-2xl mb-2">📄</span>
          <span className="text-sm font-medium">No se pudo cargar la imagen</span>
        </div>
      ) : (
        <img
          src={src}
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
            setHasError(true);
            props.onError?.(e);
          }}
          {...props}
        />
      )}
    </div>
  );
}
