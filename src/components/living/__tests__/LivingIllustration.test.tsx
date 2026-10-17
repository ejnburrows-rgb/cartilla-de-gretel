import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LivingIllustration } from "../LivingIllustration";
import { ANIMAL_GALLERY } from "@/content/animal-gallery";
import { getLivingActor } from "@/lib/living-actor-registry";

describe("LivingIllustration faithful recovered art", () => {
  for (const [word, src] of [
    ["abrigo", "/cartilla/art/faithful/leccion-1/abrigo.webp"],
    ["globo", "/cartilla/art/faithful/leccion-1/globo.webp"],
    ["oruga", "/cartilla/art/faithful/vocal-o/oruga.webp"],
  ] as const) {
    it(`keeps canonical ${word} art as fallback and wires clean responsive delivery derivatives`, () => {
      render(<LivingIllustration src={src} alt={word} />);
      const image = screen.getByRole("img", { name: word });
      expect(image.getAttribute("src")).toBe(src);
      expect(image.getAttribute("srcset")).toBe(
        `/cartilla/art/delivery/faithful/384/${src.split("/faithful/")[1]} 1x, /cartilla/art/delivery/faithful/768/${src.split("/faithful/")[1]} 2x`,
      );
      expect(image.parentElement?.getAttribute("data-ambient-motion")).toBe(
        getLivingActor(src)?.action ?? "none",
      );
      expect(screen.queryByText(/pendiente de color/i)).toBeNull();
    });
  }

  it("keeps gallery art static unless its exact source is allow-listed", () => {
    for (const animal of ANIMAL_GALLERY) {
      const { unmount } = render(
        <LivingIllustration src={animal.illustrationSrc} alt={animal.word} />,
      );
      const wrapper = screen.getByRole("img", { name: animal.word }).parentElement;
      const actor = getLivingActor(animal.illustrationSrc);
      // Pictures with built natural part motion (aliveSrc) play it inside their
      // own SVG; they never also get whole-picture CSS motion.
      expect(wrapper?.getAttribute("data-ambient-motion"), animal.word).toBe(
        actor?.aliveSrc ? "none" : (actor?.action ?? "none"),
      );
      expect(wrapper?.getAttribute("data-natural-motion"), animal.word).toBe(
        actor?.aliveSrc ? "true" : "false",
      );
      expect(wrapper?.className.includes("living-illustration--creature-life"), animal.word).toBe(
        Boolean(actor?.creature) && !actor?.aliveSrc,
      );
      unmount();
    }
  });

  it("uses a true closed-eye frame when one exists", () => {
    render(<LivingIllustration src="/cartilla/art/faithful/vocal-o/oso.webp" alt="oso" />);
    const wrapper = screen.getByRole("img", { name: "oso" }).parentElement;
    expect(wrapper?.getAttribute("data-blink-mode")).toBe("frame");
  });

  it("keeps an explicitly approved source animated and tap-reactive", () => {
    // leccion-1/pez.webp is the Workbook's airplane: it may glide as a whole.
    render(<LivingIllustration src="/cartilla/art/faithful/leccion-1/pez.webp" alt="avión" />);
    const wrapper = screen.getByRole("img", { name: "avión" }).parentElement;
    expect(wrapper?.getAttribute("data-blink-mode")).toBe("none");
    expect(wrapper?.getAttribute("data-interactive")).toBe("true");
    expect(wrapper?.querySelectorAll(".living-illustration__eyelid")).toHaveLength(0);
    expect(wrapper?.querySelectorAll(".living-illustration__part")).toHaveLength(0);
    expect(wrapper?.className).toContain("living-illustration--glide");
    expect(wrapper?.className).not.toContain("living-illustration--creature-life");
    if (!wrapper) throw new Error("missing living illustration wrapper");
    fireEvent.pointerDown(wrapper);
    expect(wrapper.className).toContain("living-illustration--reacting");
  });

  it("moves independent anatomy without applying the actor action to the whole source image", () => {
    for (const src of [
      "/cartilla/art/faithful/leccion-1/aguila.webp",
      "/cartilla/art/faithful/leccion-23-z/zorro.webp",
      "/cartilla/art/faithful/leccion-19-c/conejo.webp",
      "/cartilla/art/faithful/leccion-18-rr/perro.webp",
    ]) {
      const actor = getLivingActor(src);
      expect(actor?.parts?.length, src).toBeGreaterThan(0);
      const { container, unmount } = render(<LivingIllustration src={src} alt={src} />);
      const wrapper = container.querySelector(".living-illustration");
      expect(wrapper?.getAttribute("data-part-based")).toBe("true");
      expect(wrapper?.querySelectorAll(".living-illustration__part").length).toBe(
        actor?.parts?.length,
      );
      expect(wrapper?.className).not.toContain(`living-illustration--${actor?.action}`);
      unmount();
    }
  });

  it("renders with actor motion classes inside workbook exercise cells", () => {
    const src = "/cartilla/art/faithful/leccion-9-s/sapo.webp";
    const { container } = render(
      <div className="fp-ix-cell">
        <LivingIllustration src={src} alt="sapo" />
      </div>,
    );
    const wrapper = container.querySelector(".living-illustration");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain("living-illustration--hop");
    expect(wrapper?.className).toContain("living-illustration--creature-life");
  });

  it("holds the vowel-page pictures whose old motion moved the whole drawing still", () => {
    for (const name of [
      "vocal-o/oruga",
      "vocal-a/arana",
      "vocal-a/ardilla",
      "vocal-e/erizo",
      "vocal-i/iguana",
      "vocal-i/insecto",
      "vocal-u/unicornio",
    ]) {
      const src = `/cartilla/art/faithful/${name}.webp`;
      expect(getLivingActor(src), name).toBeNull();
      const { container, unmount } = render(
        <div className="fp-ix-cell">
          <LivingIllustration src={src} alt={name} />
        </div>,
      );
      const wrapper = container.querySelector(".living-illustration");
      expect(wrapper?.getAttribute("data-ambient-motion"), name).toBe("none");
      expect(wrapper?.className, name).not.toMatch(
        /living-illustration--(crawl|hop|breathe|nod|creature-life)/,
      );
      unmount();
    }
  });

  it("plays natural part motion for the Workbook vowel-review pictures, with no whole-picture CSS motion", () => {
    for (const [src, alive] of [
      ["/cartilla/art/faithful/vocal-o/oso.webp", "oso-alive.svg"],
      ["/cartilla/art/faithful/vocal-o/oveja.webp", "oveja-alive.svg"],
      ["/cartilla/art/faithful/vocal-o/olla.webp", "olla-alive.svg"],
      ["/cartilla/art/faithful/vocal-e/elefante.webp", "elefante-alive.svg"],
      ["/cartilla/art/faithful/vocal-a/abeja.webp", "abeja-alive.svg"],
      ["/cartilla/art/faithful/vocal-a/abanico.webp", "abanico-alive.svg"],
      ["/cartilla/art/faithful/vocal-i/iman.webp", "iman-alive.svg"],
    ]) {
      const { container, unmount } = render(
        <div className="fp-ix-cell">
          <LivingIllustration src={src} alt={alive} />
        </div>,
      );
      const wrapper = container.querySelector(".living-illustration");
      expect(wrapper?.getAttribute("data-natural-motion"), src).toBe("true");
      expect(wrapper?.getAttribute("data-ambient-motion"), src).toBe("none");
      expect(wrapper?.querySelectorAll(".living-illustration__part").length, src).toBe(0);
      expect(wrapper?.className, src).not.toMatch(
        /living-illustration--(breathe|nod|hover|glide|float|sway|creature-life)/,
      );
      expect(
        container.querySelector("img.living-illustration__art")?.getAttribute("src"),
        src,
      ).toContain(alive);
      unmount();
    }
  });

  it("keeps the redrawn vowel-a jet still (no propeller; its sky must not move)", () => {
    const { container, unmount } = render(
      <div className="fp-ix-cell">
        <LivingIllustration src="/cartilla/art/faithful/vocal-a/avion.webp" alt="avión" />
      </div>,
    );
    const wrapper = container.querySelector(".living-illustration");
    expect(wrapper?.getAttribute("data-ambient-motion")).toBe("none");
    expect(wrapper?.getAttribute("data-natural-motion")).not.toBe("true");
    expect(container.querySelector("img.living-illustration__art")?.getAttribute("src")).toContain(
      "vocal-a/avion.webp",
    );
    unmount();
  });

  it("preserves the approved source but suppresses motion when reduced motion is requested", async () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    try {
      render(<LivingIllustration src="/cartilla/art/faithful/vocal-o/oso.webp" alt="oso quieto" />);
      const wrapper = screen.getByRole("img", { name: "oso quieto" }).parentElement;
      await waitFor(() => expect(wrapper?.getAttribute("data-ambient-motion")).toBe("none"));
      expect(screen.getByRole("img", { name: "oso quieto" }).getAttribute("src")).toContain(
        "oso.webp",
      );
    } finally {
      window.matchMedia = original;
    }
  });
  it("plays the owner-approved natural motion SVG for Page 1 pictures, with no extra CSS motion (owner 2026-10-06)", () => {
    const W1 = "/cartilla/art/optimized/workbook/leccion-1";
    for (const name of ["oso", "elefante", "oveja", "abanico", "avion", "iman", "olla"]) {
      const { unmount } = render(<LivingIllustration src={`${W1}/${name}.svg`} alt={name} />);
      const image = screen.getByRole("img", { name });
      expect(image.getAttribute("src"), name).toBe(`${W1}/${name}-alive.svg`);
      expect(image.parentElement?.getAttribute("data-natural-motion"), name).toBe("true");
      expect(image.parentElement?.getAttribute("data-ambient-motion"), name).toBe("none");
      unmount();
    }
  });

  it("shows the still Page 1 drawing when reduced motion is requested", async () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    try {
      const src = "/cartilla/art/optimized/workbook/leccion-1/elefante.svg";
      render(<LivingIllustration src={src} alt="elefante quieto" />);
      const image = screen.getByRole("img", { name: "elefante quieto" });
      await waitFor(() => expect(image.getAttribute("src")).toBe(src));
      expect(image.parentElement?.getAttribute("data-natural-motion")).toBe("false");
    } finally {
      window.matchMedia = original;
    }
  });
});
