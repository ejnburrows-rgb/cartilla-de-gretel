import React, { useRef, useState } from "react";
import { useIntersectionLazy } from "../../hooks/useIntersectionLazy";

interface ImageOptimizedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataUrl?: string;
  containerClassName?: string;
  priority?: boolean;
}

export function ImageOptimized({
  src,
  alt,
  blurDataUrl,
  className = "",
  containerClassName = "",
  priority = false,
  onLoad,
  ...props
}: ImageOptimizedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionLazy(containerRef, {
    rootMargin: "200px", // Pre-load 200px before entry
    triggerOnce: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const isRaster = /\.(png|jpe?g)$/i.test(src);
  const webpSrc = isRaster ? src.replace(/\.(png|jpe?g)$/i, ".webp") : null;

  return (
    <div ref={containerRef} className={`image-optimized-container ${containerClassName}`}>
      {/* Blur-up placeholder */}
      {blurDataUrl && !isLoaded && (
        <img src={blurDataUrl} alt="" aria-hidden="true" className="image-optimized-blur" />
      )}

      {(isIntersecting || priority) && (
        <picture>
          {webpSrc && webpSrc !== src && (
            <source srcSet={webpSrc} type="image/webp" />
          )}
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "auto" : "async"}
            {...(priority ? ({ fetchPriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>) : {})}
            className={`${className} ${isLoaded ? "image-optimized-loaded" : "image-optimized-loading"}`}
            onLoad={(e) => {
              setIsLoaded(true);
              onLoad?.(e);
            }}
            {...props}
          />
        </picture>
      )}
    </div>
  );
}

export default ImageOptimized;
