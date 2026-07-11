// @vitest-environment jsdom
import "@testing-library/jest-dom";
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LivingWorkbookPage } from "@/components/cartilla/LivingWorkbookPage";
import { clearAllProgressEvents, getAnswersForPage, getCompletionsForPage } from "@/lib/progress-events";

describe("LivingWorkbookPage", () => {
  beforeEach(() => {
    clearAllProgressEvents();
  });

  it("should render page header, instruction, and responsive background canvas", () => {
    render(<LivingWorkbookPage pageNumber={1} />);

    expect(screen.getByTestId("living-workbook-page")).toBeInTheDocument();
    expect(screen.getByText(/Página 1 · Lección 1/i)).toBeInTheDocument();
  });

  it("should handle TapSelect interaction and record answer in progress-events", () => {
    render(<LivingWorkbookPage pageNumber={1} />);

    const btns = screen.getAllByRole("button");
    expect(btns.length).toBeGreaterThan(0);

    fireEvent.click(btns[0]);

    const answers = getAnswersForPage(1);
    expect(answers.length).toBeGreaterThan(0);
    expect(answers[0].isCorrect).toBe(true);
  });

  it("should record completion when all interactions on the page are completed", () => {
    const onCompleted = vi.fn();
    render(<LivingWorkbookPage pageNumber={1} onPageCompleted={onCompleted} />);

    const btns = screen.getAllByRole("button");
    for (const btn of btns) {
      fireEvent.click(btn);
    }

    expect(onCompleted).toHaveBeenCalled();
    const completions = getCompletionsForPage(1);
    expect(completions.length).toBe(1);
    expect(completions[0].score).toBe(100);
  });
});
