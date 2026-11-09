import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { FlipchartReplicaSheet } from "../FlipchartReplicaSheet";
import { getReplicaSheet } from "@/lib/flipchart-replica";

afterEach(cleanup);
const originals = [
  [35, 3406, 4345, "d42b78a8d8f14fe4562a709258a58bd5767b218443c5a0a6beb92383e4af1805"],
  [41, 3410, 4343, "c83ac3f90721e4e92f817895bb7461bcf4e01c535e52c6c21be917651e914952"],
  [47, 3408, 4343, "a45f84f08071e160228586a8befbc8ea4e3a333c8a6938323c3fe1e626389c9a"],
  [53, 3406, 4344, "d8352af3318611db766e6fc33444bea6f09982c9c9f072d1c68171b7ac349ded"],
] as const;

describe("approved complete Flip Chart sources", () => {
  it.each(originals)("preserves original bytes and one visible sheet on page %i", (page, width, height, hash) => {
    const sheet = getReplicaSheet(page)!;
    expect(sheet.fullSheet).toMatchObject({ width, height, sha256: hash });
    expect(sheet.height).toBeCloseTo(1000 * height / width);
    expect(sheet.fullSheet!.approval).toContain("issuecomment-6630382439");
    const bytes = readFileSync(`public${sheet.fullSheet!.src}`);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
    const { container } = render(<FlipchartReplicaSheet pageNumber={page} />);
    const image = container.querySelector("img")!;
    expect(image.getAttribute("src")).toBe(sheet.fullSheet!.src);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector(".fc-replica__spiral, .fc-replica__canvas, .fc-replica__panel, .fc-replica__text, .fc-replica__medallion, .fc-replica__art, .fc-replica__pagenum")).toBeNull();
    const transcript = container.querySelector("[data-source-transcript]")!;
    expect(transcript.className).toBe("sr-only");
    expect(transcript.textContent).toBe(sheet.tokens.map(token => token.text).join(""));
  });

  it("keeps decorative filmstrip sheets out of the accessible reading sequence", () => {
    const { container } = render(<FlipchartReplicaSheet pageNumber={35} decorative />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("img")?.getAttribute("loading")).toBe("lazy");
    expect(container.querySelector("[data-source-transcript]")).toBeNull();
  });

  it("reports a missing original without a clipped-scene fallback and recovers on another sheet", () => {
    const { container, rerender } = render(<FlipchartReplicaSheet pageNumber={35} />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByRole("status").textContent).toContain("no está disponible");
    expect(container.querySelector("img, .fc-replica__art")).toBeNull();
    rerender(<FlipchartReplicaSheet pageNumber={41} />);
    expect(container.querySelector("img")?.getAttribute("src")).toContain("p041-full-sheet.jpg");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
