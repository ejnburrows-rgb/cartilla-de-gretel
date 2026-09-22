import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GretelLiveAvatar } from "../GretelLiveAvatar";

describe("GretelLiveAvatar direct interaction", () => {
  it("is a real tappable and keyboard-focusable character", () => {
    render(<GretelLiveAvatar size="sm" />);
    const avatar = screen.getByRole("button", { name: "Interactuar con Gretel" });
    expect(avatar.getAttribute("data-interactive")).toBe("true");
    expect(avatar.getAttribute("tabindex")).toBe("0");
    expect(avatar.className).toContain("gretel-avatar-interactive");
  });
});
