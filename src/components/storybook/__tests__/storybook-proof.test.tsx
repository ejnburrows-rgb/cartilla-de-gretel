import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { advanceLearning, freshLearningState } from "@/components/gretel/gretelLearning";
import {
  isStorybookPage,
  isStorybookPlate,
  storybookLines,
  STORYBOOK_FLIPCHART_PLATES,
} from "@/content/storybook-proof";

vi.mock("@/lib/speak", () => ({ speak: vi.fn(() => Promise.resolve()) }));

import {
  PLATE_16,
  PLATE_17,
  StorybookFlipchartPlate,
} from "@/components/storybook/StorybookFlipchartPlate";
import { speak } from "@/lib/speak";

describe("storybook proof scope", () => {
  it("applies only to Workbook pages 4–5 and Flip Chart plates 16–17", () => {
    expect([3, 4, 5, 6].map(isStorybookPage)).toEqual([false, true, true, false]);
    expect([15, 16, 17, 18].map(isStorybookPlate)).toEqual([false, true, true, false]);
  });

  it("uses living scenery (never a plain light/gradient scene) on both plates", () => {
    expect(STORYBOOK_FLIPCHART_PLATES[16]?.scene).toBe("garden");
    expect(STORYBOOK_FLIPCHART_PLATES[17]?.scene).toBe("pond");
  });
});

describe("per-item learning policy (Workbook proof pages)", () => {
  it("cue → hint → demonstration, then an assisted correct hands control back without a reset", () => {
    let s = freshLearningState();
    const reactions: Array<string | null> = [];
    for (const input of ["wrong", "wrong", "wrong"] as const) {
      const r = advanceLearning(s, input, { perItem: true });
      s = r.state;
      reactions.push(r.reaction);
    }
    expect(reactions).toEqual(["cue", "hint", "demonstration"]);
    const assisted = advanceLearning(s, "correct", { perItem: true });
    expect(assisted.reaction).toBe("independent-retry");
    expect(assisted.state).toMatchObject({
      errors: 0,
      assisted: false,
      retryPending: false,
      mastered: false,
    });
    const next = advanceLearning(assisted.state, "correct", { perItem: true });
    expect(next.reaction).toBe("success");
    expect(advanceLearning(next.state, "complete", { perItem: true }).reaction).toBe("mastery");
  });

  it("finishing after help still reaches mastery on per-item pages", () => {
    const helped = advanceLearning(freshLearningState(), "hint", { perItem: true }).state;
    expect(advanceLearning(helped, "complete", { perItem: true }).reaction).toBe("mastery");
  });

  it("builds Gretel's lines from the real tapped word", () => {
    expect(storybookLines({ pageNumber: 4, word: "ola", correct: true, left: 7 }).success).toBe(
      "¡Ola! Sí, ola empieza con o. Te faltan siete.",
    );
    expect(storybookLines({ pageNumber: 4, word: "iglú", correct: false, left: 7 }).cue).toBe(
      "Iglú. Iglú empieza con i. Busca un dibujo que empiece con o.",
    );
    expect(storybookLines({ pageNumber: 5, left: 0 }).mastery).toMatch(/Trazaste todas las líneas/);
  });
});

describe("Flip Chart plate 16 (printed folio 14)", () => {
  it("keeps the printed syllable rows, word columns and sight-word bar", () => {
    expect(PLATE_16.rows.map((r) => r.join(" "))).toEqual(["sa se si so su", "su so sa se si"]);
    expect(PLATE_16.words.map((c) => c.join(" "))).toEqual([
      "masa sapo así puso Sisi",
      "mesa seso sopa supo ese",
      "suma Susi paso supe esa",
    ]);
    expect(PLATE_16.sightWords.join(" ")).toBe("es de un está en la el");
  });

  it("prints exactly the book's bold sight words in the sentences", () => {
    const { container } = render(<StorybookFlipchartPlate plate={16} />);
    const bold = [...container.querySelectorAll(".sbfc__sentence")].map((s) =>
      [...s.querySelectorAll("b")].map((b) => b.textContent).join(" "),
    );
    expect(bold).toEqual([
      "La es de",
      "La está en la",
      "la",
      "la",
      "es de Es el",
      "el",
      "un en la",
    ]);
  });

  it("tapping a sight word lights every occurrence and reads it aloud", () => {
    const { container } = render(<StorybookFlipchartPlate plate={16} />);
    const bar = screen.getByRole("group", { name: "Palabras de uso frecuente" });
    fireEvent.click(within(bar).getByRole("button", { name: "la" }));
    expect(container.querySelectorAll(".sbfc__sight-in[data-lit]")).toHaveLength(6);
    expect(speak).toHaveBeenCalledWith("la");
  });
});

describe("Flip Chart plate 17 (printed folio 15)", () => {
  it("shows the verse verbatim and spotlights the tapped line", () => {
    const { container } = render(<StorybookFlipchartPlate plate={17} />);
    expect(PLATE_17.verse).toEqual([
      "Sapo Samapo",
      "en la mesa está",
      "sapo Samapo",
      "sa-po-mi-pa.",
    ]);
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe(
      "/cartilla/art/optimized/flipchart-native/p017-scene.png",
    );
    fireEvent.click(screen.getByRole("button", { name: "en la mesa está" }));
    expect(container.querySelector(".sbfc__verse")?.getAttribute("data-spotlight")).toBe("true");
    expect(container.querySelector("[data-active]")?.textContent).toBe("en la mesa está");
  });
});
