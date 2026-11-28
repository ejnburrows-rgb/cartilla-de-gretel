import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PictureAudioLifecycle } from "../PictureAudioLifecycle";
vi.mock("@tanstack/react-router", () => ({ useRouterState: () => "/cartilla/leccion/1" }));
vi.mock("@/lib/picture-audio", () => ({
  installPictureAudio: () => () => {},
  stopPicturePlayback: vi.fn(),
}));
afterEach(cleanup);
function status(detail: string) {
  act(() => {
    window.dispatchEvent(new CustomEvent("cartilla:picture-audio-status", { detail }));
  });
}
describe("passive picture audio feedback", () => {
  it("silently clears a failed playback instead of interrupting the exercise", () => {
    render(<PictureAudioLifecycle />);
    status("muted");
    expect(screen.getByRole("status").textContent).toBe("El sonido está silenciado.");
    status("failed");
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("retains honest missing-recording feedback", () => {
    render(<PictureAudioLifecycle />);
    status("missing-recording");
    expect(screen.getByRole("status").textContent).toBe(
      "El audio de este dibujo aún no está disponible.",
    );
    status("recorded");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
