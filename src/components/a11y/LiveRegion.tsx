import React, { useState, useEffect } from "react";

export function LiveRegion() {
  const [announcement, setAnnouncement] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAnnounce = (e: Event) => {
      const text = (e as CustomEvent)?.detail?.text || "";
      setAnnouncement(text);

      // Auto-clear announcement after a few seconds so same announcement can be repeated
      const timer = setTimeout(() => {
        setAnnouncement("");
      }, 3500);

      return () => clearTimeout(timer);
    };

    window.addEventListener("cartilla:a11y-announce", handleAnnounce);
    return () => {
      window.removeEventListener("cartilla:a11y-announce", handleAnnounce);
    };
  }, []);

  return (
    <div
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    >
      {announcement}
    </div>
  );
}

// Global announcement helper
export function announceToScreenReader(text: string) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent("cartilla:a11y-announce", {
    detail: { text },
  });
  window.dispatchEvent(event);
}
