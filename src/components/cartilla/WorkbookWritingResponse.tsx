import { useRef, useState } from "react";
import { gretelEvent } from "@/lib/gretel-bus";

/** Enough writing to count the page's open-ended task as done (no grading). */
export function isWritingResponseDone(value: string): boolean {
  return value.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w)).length >= 2;
}

/** Open-ended writing stays open-ended; no guessed grading or answer key. */
export function WorkbookWritingResponse({ pageNumber, interactive }: { pageNumber: number; interactive: boolean }) {
  const key = `cartilla-writing-page-${pageNumber}`;
  const [value, setValue] = useState(() => {
    try { return window.localStorage.getItem(key) ?? ""; } catch { return ""; }
  });
  const reported = useRef(false);
  if (!interactive) return <div className="fp-writing-response__lines" aria-label="Renglones para escribir" />;
  return (
    <label className="fp-writing-response">
      <span>Mis oraciones</span>
      <textarea
        aria-label="Escribe tus oraciones"
        rows={5}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (!reported.current && isWritingResponseDone(event.target.value)) {
            reported.current = true;
            gretelEvent("activity:complete");
          }
          if (reported.current && !isWritingResponseDone(event.target.value)) {
            reported.current = false;
            gretelEvent("activity:retry");
          }
          try { window.localStorage.setItem(key, event.target.value); } catch { /* storage can be disabled */ }
        }}
      />
    </label>
  );
}
