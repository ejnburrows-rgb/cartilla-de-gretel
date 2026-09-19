/**
 * @vitest-environment jsdom
 * Launch bar: no emoji object hints in WordMatch picture tiles.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { WordMatch } from "../Ejercicios";

vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
  useStudentSession: () => null,
}));
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ play: vi.fn(), playingText: null }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
}));

afterEach(() => cleanup());

describe("WordMatch — no emoji object hints", () => {
  it("renders illustrationSrc tiles, never emoji glyphs as picture targets", () => {
    const { container } = render(
      <WordMatch
        color="#e11d48"
        lessonId="7"
        words={[
          {
            word: "mamá",
            emoji: "👩",
            illustrationSrc: "/cartilla/art/faithful/leccion-7-m/mama.webp",
          },
          {
            word: "mono",
            emoji: "🐒",
            illustrationSrc: "/cartilla/art/faithful/leccion-7-m/mono.webp",
          },
        ]}
      />,
    );
    expect(container.querySelector('[data-emoji-objects="false"]')).toBeTruthy();
    expect(container.textContent).not.toContain("👩");
    expect(container.textContent).not.toContain("🐒");
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBeGreaterThanOrEqual(2);
    const srcs = [...imgs].map((img) => img.getAttribute("src") || "").join(" ");
    expect(srcs).toMatch(/mama\.webp|mono\.webp/);
  });

  it("shows honest pendiente when no art (still no emoji)", () => {
    render(
      <WordMatch
        color="#0369a1"
        words={[
          { word: "foto", emoji: "📷" },
          { word: "fideos", emoji: "🍜" },
        ]}
      />,
    );
    expect(screen.getAllByText(/pendiente/i).length).toBeGreaterThanOrEqual(1);
    expect(document.body.textContent).not.toContain("📷");
    expect(document.body.textContent).not.toContain("🍜");
  });
});
