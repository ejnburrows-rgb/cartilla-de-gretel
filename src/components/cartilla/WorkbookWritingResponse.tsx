import { useState } from "react";

/** Open-ended writing stays open-ended; no guessed grading or answer key. */
export function WorkbookWritingResponse({ pageNumber, interactive }: { pageNumber: number; interactive: boolean }) {
  const key = `cartilla-writing-page-${pageNumber}`;
  const [value, setValue] = useState(() => {
    try { return window.localStorage.getItem(key) ?? ""; } catch { return ""; }
  });
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
          try { window.localStorage.setItem(key, event.target.value); } catch { /* storage can be disabled */ }
        }}
      />
    </label>
  );
}
