import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PayasoChano } from "../PayasoChano";
import { PAYASO_CHANO_SS } from "@/content/games/payaso-chano-ss";

beforeEach(() => {
  class MockAudio {
    src = "";
    play = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    constructor(src?: string) {
      if (src) this.src = src;
    }
  }
  window.Audio = MockAudio as unknown as typeof Audio;
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("PayasoChano Big-Top Circus Theater Visual Standard", () => {
  it("mounts the full circus theater stage with canopy, marquee, and footlights", () => {
    const { container } = render(<PayasoChano content={PAYASO_CHANO_SS} />);

    // Theater root
    expect(screen.getByRole("main", { name: "Teatro del Payaso Chano" })).toBeTruthy();

    // Marquee and Counter
    expect(screen.getByText("Juego Payaso Chano")).toBeTruthy();
    expect(screen.getByText(/Palabra 1 de 8/i)).toBeTruthy();

    // Floor shadow and spotlight
    expect(container.querySelector(".chano-floor-shadow")).toBeTruthy();
    expect(container.querySelector(".chano-spotlight-cone")).toBeTruthy();

    // Juggling cascade and dynamic floor shadows
    expect(container.querySelectorAll(".chano-juggle-ball").length).toBe(3);
    expect(container.querySelectorAll(".chano-juggle-shadow").length).toBe(3);

    // Brass footlights apron with 7 footlights
    expect(container.querySelectorAll(".chano-footlight").length).toBe(7);
  });

  it("provides physical brass controls and props with >= 56px minimum touch targets", () => {
    render(<PayasoChano content={PAYASO_CHANO_SS} />);

    const sombrilla = screen.getByRole("button", { name: /Sombrilla: comprobar la palabra/i });
    const resorte = screen.getByRole("button", {
      name: /Resorte: colocar las sílabas en su lugar otra vez/i,
    });
    const horn = screen.getByRole("button", { name: /Escuchar la palabra/i });
    const next = screen.getByRole("button", { name: /Chano: escuchar la próxima palabra/i });

    expect(sombrilla).toBeTruthy();
    expect(resorte).toBeTruthy();
    expect(horn).toBeTruthy();
    expect(next).toBeTruthy();

    // All controls have class chano-prop-lever (which enforces min-height: 56px)
    expect(sombrilla.className).toContain("chano-prop-lever");
    expect(resorte.className).toContain("chano-prop-lever");
    expect(horn.className).toContain("chano-prop-lever");
    expect(next.className).toContain("chano-prop-lever");
  });

  it("renders chalkboard easel with slots and prop chest with tactile syllable blocks", () => {
    render(<PayasoChano content={PAYASO_CHANO_SS} />);

    // Chalkboard easel slots
    const slots = screen.getAllByRole("generic").filter((el) =>
      el.getAttribute("aria-label")?.startsWith("Casilla "),
    );
    expect(slots.length).toBe(PAYASO_CHANO_SS.words[0].syllables.length);

    // Syllable blocks in prop chest
    const blocks = screen.getAllByRole("button").filter((btn) =>
      btn.getAttribute("aria-label")?.startsWith("Sílaba "),
    );
    expect(blocks.length).toBe(PAYASO_CHANO_SS.words[0].syllables.length);
  });

  it("plays through correct word assembly and triggers celebration", () => {
    const onComplete = vi.fn();
    render(<PayasoChano content={PAYASO_CHANO_SS} onComplete={onComplete} />);

    const targetSyllables = PAYASO_CHANO_SS.words[0].syllables; // "paso": ["pa", "so"]

    for (let slotIdx = 0; slotIdx < targetSyllables.length; slotIdx++) {
      const syl = targetSyllables[slotIdx];
      const btn = screen.getByRole("button", { name: `Sílaba ${syl}` });
      fireEvent.click(btn); // Tap-to-place
    }

    // Check button should now be enabled
    const checkBtn = screen.getByRole("button", { name: /Sombrilla: comprobar la palabra/i });
    expect(checkBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(checkBtn);

    // Verification banner appears
    expect(screen.getByText(/¡Excelente! Palabra «paso» completa./i)).toBeTruthy();
  });
});
