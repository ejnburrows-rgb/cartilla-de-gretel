/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CoordinateMapper } from "../CoordinateMapper";
import React from "react";

describe("CoordinateMapper", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 1000,
      top: 0,
      left: 0,
      bottom: 1000,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing initially", () => {
    const { container } = render(<CoordinateMapper pageNumber={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("toggles visibility with Ctrl+Shift+M and can be closed", () => {
    render(<CoordinateMapper pageNumber={1} />);

    // Open
    fireEvent.keyDown(window, { key: "m", ctrlKey: true, shiftKey: true });
    expect(screen.getByText("Mapper Mode: Página 1")).toBeInTheDocument();

    // Close
    fireEvent.click(screen.getByLabelText("Cerrar Mapper Mode"));
    expect(screen.queryByText("Mapper Mode: Página 1")).not.toBeInTheDocument();
  });

  it("draws a box and generates JSON when pointer events are simulated", () => {
    const { container } = render(<CoordinateMapper pageNumber={1} />);
    fireEvent.keyDown(window, { key: "m", ctrlKey: true, shiftKey: true });

    const rootContainer = container.firstChild as HTMLElement;

    fireEvent.pointerDown(rootContainer, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(rootContainer, { clientX: 300, clientY: 400 });
    fireEvent.pointerUp(rootContainer, { pointerId: 1 });

    const generatedJson = screen.getByText(/"xPercent": 10/);
    expect(generatedJson).toBeInTheDocument();
    expect(generatedJson.textContent).toContain('"yPercent": 10');
    expect(generatedJson.textContent).toContain('"widthPercent": 20');
    expect(generatedJson.textContent).toContain('"heightPercent": 30');
  });

  it("copies generated JSON to clipboard", () => {
    const { container } = render(<CoordinateMapper pageNumber={1} />);
    fireEvent.keyDown(window, { key: "m", ctrlKey: true, shiftKey: true });

    const rootContainer = container.firstChild as HTMLElement;

    fireEvent.pointerDown(rootContainer, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(rootContainer, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(rootContainer, { pointerId: 1 });

    const copyButton = screen.getByText(/Copiar JSON/i);
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
