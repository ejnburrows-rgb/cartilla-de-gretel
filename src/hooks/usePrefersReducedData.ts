import { useEffect, useState } from "react";

/** Non-standard Network Information API surface (Save-Data). */
type NetworkInformationLike = {
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function getConnection(): NetworkInformationLike | undefined {
  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  return nav.connection || nav.mozConnection || nav.webkitConnection;
}

export function usePrefersReducedData(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;

    // Check navigator.connection.saveData (Save-Data)
    const conn = getConnection();
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
      const conn = getConnection();
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
    const conn = getConnection();
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
