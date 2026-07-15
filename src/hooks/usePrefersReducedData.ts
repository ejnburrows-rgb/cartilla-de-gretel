import { useEffect, useState } from "react";

export function usePrefersReducedData(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;

    // Check navigator.connection.saveData (Save-Data)
    const conn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const saveData = conn ? !!conn.saveData : false;

    // Check media query prefers-reduced-data
    const mediaQuery = window.matchMedia("(prefers-reduced-data: reduce)");
    const reducedDataQuery = mediaQuery.matches;

    return saveData || reducedDataQuery;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-data: reduce)");

    const handleChange = () => {
      const conn =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      const saveData = conn ? !!conn.saveData : false;
      setPrefersReduced(saveData || mediaQuery.matches);
    };

    // Listen for changes to the media query
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // Listen for changes to navigator.connection if supported
    const conn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (conn && conn.addEventListener) {
      conn.addEventListener("change", handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      if (conn && conn.removeEventListener) {
        conn.removeEventListener("change", handleChange);
      }
    };
  }, []);

  return prefersReduced;
}
export type UsePrefersReducedData = typeof usePrefersReducedData;
