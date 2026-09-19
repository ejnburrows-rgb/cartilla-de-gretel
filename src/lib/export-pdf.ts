/**
 * export-pdf.ts — Lane A
 * Utility functions for triggering browser print.
 */

export function triggerPrint() {
  if (typeof window !== "undefined") {
    // Wait a brief moment to ensure any print styles or DOM changes are applied
    setTimeout(() => {
      window.print();
    }, 100);
  }
}

export function exportLessonPdf(lessonId: string) {
  // In a more complex setup, this might open a new window with the print view
  // and trigger print there. For now, if we are on the print view, just print.
  // Otherwise, we navigate to the print view.
  if (window.location.pathname.includes("/print/")) {
    triggerPrint();
  } else {
    window.open(`/print/${lessonId}`, "_blank");
  }
}

export function exportFullBinderPdf() {
  if (window.location.pathname.includes("/print/binder")) {
    triggerPrint();
  } else {
    window.open("/print/binder", "_blank");
  }
}
