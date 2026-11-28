import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TutorTargetWord } from "../TutorTargetWord";

describe("TutorTargetWord", () => {
  it("only highlights the model word while an actual recording is playing", () => {
    const { rerender } = render(<TutorTargetWord word="oso" playing={false} />);
    const word = screen.getByLabelText("oso");

    expect(word.getAttribute("data-playing")).toBe("false");
    expect(word.querySelectorAll('[data-highlighted="true"]')).toHaveLength(0);

    rerender(<TutorTargetWord word="oso" playing={true} />);
    expect(word.getAttribute("data-playing")).toBe("true");
    expect(word.querySelectorAll('[data-highlighted="true"]')).toHaveLength(3);

    rerender(<TutorTargetWord word="oso" playing={false} />);
    expect(word.getAttribute("data-playing")).toBe("false");
    expect(word.querySelectorAll('[data-highlighted="true"]')).toHaveLength(0);
  });

  it("retains the original word and its accessible label", () => {
    render(<TutorTargetWord word="uña" playing={false} />);
    expect(screen.getByLabelText("uña").textContent).toBe("uña");
  });

  it("keeps single long words inside one unbroken word token and wraps multi-word sentences only at spaces", () => {
    const { rerender } = render(<TutorTargetWord word="elefante" playing={false} />);
    const single = screen.getByLabelText("elefante");
    expect(single.getAttribute("data-multi-word")).toBe("false");
    expect(single.style.getPropertyValue("--tutor-word-chars")).toBe("8");
    const singleTokens = single.querySelectorAll(".tutor-word-token");
    expect(singleTokens).toHaveLength(1);
    expect(singleTokens[0].textContent).toBe("elefante");
    expect(singleTokens[0].className).toContain("whitespace-nowrap");

    rerender(<TutorTargetWord word="Mi mamá me ama." playing={true} />);
    const sentence = screen.getByLabelText("Mi mamá me ama.");
    expect(sentence.getAttribute("data-multi-word")).toBe("true");
    expect(sentence.textContent).toBe("Mi mamá me ama.");
    const wordTokens = Array.from(sentence.querySelectorAll(".tutor-word-token")).map(
      (node) => node.textContent,
    );
    expect(wordTokens).toEqual(["Mi", "mamá", "me", "ama."]);
  });
});
