/**
 * Audible instruction playback has been retired from the student book.
 * Returning null removes the misleading speaker control without changing the
 * page renderer or any protected instructional text.
 */
export function EscucharInstruccionButton(_props: { text: string; className?: string }) {
  return null;
}
