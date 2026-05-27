import React, { useRef, useState } from "react";
import { useIntersectionLazy } from "../../hooks/useIntersectionLazy";

interface ImageOptimizedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataUrl?: string;
  containerClassName?: string;
}

export function ImageOptimized({
  src,
  alt,
  blurDataUrl,
  className = "",
  containerClassName = "",
  ...props
}: ImageOptimizedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionLazy(containerRef, {
    rootMargin: "200px", // Pre-load 200px before entry
    triggerOnce: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const avifSrc = src.replace(/\.(png|jpg|jpeg)$/i, ".avif");
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, ".webp");

  return (
    <div
      ref={containerRef}
      className={`image-optimized-container ${containerClassName}`}
    >
      {/* Blur-up placeholder */}
      {blurDataUrl && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden="true"
          className="image-optimized-blur"
        />
      )}

      {isIntersecting && (
        <picture>
          <source srcSet={avifSrc} type="image/avif" />
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`${className} ${isLoaded ? "image-optimized-loaded" : "image-optimized-loading"}`}
            onLoad={() => setIsLoaded(true)}
            {...props}
          />
        </picture>
      )}
    </div>
  );
}

export default ImageOptimized;
