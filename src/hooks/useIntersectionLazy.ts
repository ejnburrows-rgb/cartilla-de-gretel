import { useEffect, useState, RefObject } from "react";

export interface UseIntersectionLazyOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersectionLazy(
  elementRef: RefObject<Element | null>,
  options: UseIntersectionLazyOptions = {}
): boolean {
  const { root = null, rootMargin = "0px", threshold = 0, triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, root, rootMargin, threshold, triggerOnce]);

  return isIntersecting;
}
export type UseIntersectionLazy = typeof useIntersectionLazy;
