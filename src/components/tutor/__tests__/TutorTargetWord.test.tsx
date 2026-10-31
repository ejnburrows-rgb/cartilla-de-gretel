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
});
