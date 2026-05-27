/**
 * binder-export.ts
 *
 * Light weight print utility using standard browser window.print() API.
 * No heavy external PDF packages required.
 */

export function exportBinderToPdf() {
  if (typeof window !== "undefined") {
    window.print();
  }
}
