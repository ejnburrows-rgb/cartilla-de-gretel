import { describe, expect, it, vi } from "vitest";
import { gretelEvent, onGretelEvent } from "../gretel-bus";

describe("gretel bus detail", () => {
  it("delivers the page guidance text with page:revealed", () => {
    const handler = vi.fn();
    const off = onGretelEvent(handler);
    gretelEvent("page:revealed", { text: "Lee estas palabras.", pageNumber: 8 });
    expect(handler).toHaveBeenCalledWith(
      "page:revealed",
      expect.objectContaining({ text: "Lee estas palabras.", pageNumber: 8 }),
    );
    off();
  });
});
