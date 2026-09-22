import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { GretelLiveAvatar, type GretelLiveAvatarRef } from "../GretelLiveAvatar";

vi.mock("@/lib/gretel-voice", () => ({
  speakAsGretel: vi.fn(() => Promise.resolve()),
}));

describe("GretelLiveAvatar direct interaction", () => {
  it("keeps spoken guidance visible in a real speech bubble long enough to read", async () => {
    vi.useFakeTimers();
    const ref = createRef<GretelLiveAvatarRef>();
    render(<GretelLiveAvatar ref={ref} size="sm" />);
    await act(async () => {
      const speaking = ref.current?.speakMessage("Lee las palabras.");
      await Promise.resolve();
      expect(screen.getByRole("status").textContent).toBe("Lee las palabras.");
      vi.advanceTimersByTime(5000);
      await speaking;
    });
    expect(screen.queryByRole("status")).toBeNull();
    vi.useRealTimers();
  });

  it("is a real tappable and keyboard-focusable character", () => {
    render(<GretelLiveAvatar size="sm" />);
    const avatar = screen.getByRole("button", { name: "Interactuar con Gretel" });
    expect(avatar.getAttribute("data-interactive")).toBe("true");
    expect(avatar.getAttribute("tabindex")).toBe("0");
    expect(avatar.className).toContain("gretel-avatar-interactive");
  });
});
