/**
 * Minimal structural types for react-pageflip, which ships without usable
 * TypeScript types. Shared by BookPageFlip and CurlPageViewer.
 */
import type * as React from "react";

/** The imperative API returned by the flipbook's pageFlip() accessor. */
export type PageFlipApi = {
  getCurrentPageIndex?: () => number;
  turnToPage?: (pageIndex: number) => void;
  flip?: (pageIndex: number) => void;
  flipPrev?: () => void;
  flipNext?: () => void;
};

/** The component instance handle exposed through the ref. */
export type FlipBookHandle = {
  pageFlip?: () => PageFlipApi | undefined;
};

/** Flip event payload ({ data: newPageIndex }). */
export type FlipEvent = { data?: unknown };

/** Ref-accepting component type to cast the untyped HTMLFlipBook import to. */
export type FlipBookComponent = React.ForwardRefExoticComponent<
  Record<string, unknown> & React.RefAttributes<FlipBookHandle>
>;
