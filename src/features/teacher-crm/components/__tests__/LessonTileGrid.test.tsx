/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonTileGrid, LessonTileLegend } from "../LessonTileGrid";
import type { LessonTileState } from "@/lib/progress-calculation";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, title, className }: {
    to: string;
    params?: { classId: string; studentId: string; lessonId: string };
    children: React.ReactNode;
    title?: string;
    className?: string;
  }) => (
    <a 
      href={params ? to.replace("$classId", params.classId).replace("$studentId", params.studentId).replace("$lessonId", params.lessonId) : to} 
      title={title}
      className={className}
      data-testid={`lesson-tile-${params?.lessonId}`}
    >
      {children}
    </a>
  ),
}));

describe("LessonTileGrid", () => {
  const classId = "test-class-id";
  const studentId = "test-student-id";
  
  it("renders a tile for each lesson state provided", () => {
    const tiles: LessonTileState[] = [
      { lessonNumber: 1, status: "completed", assigned: false },
      { lessonNumber: 2, status: "in_progress", assigned: false },
      { lessonNumber: 3, status: "not_started", assigned: false },
    ];
    
    render(<LessonTileGrid tiles={tiles} classId={classId} studentId={studentId} />);
    
    const tile1 = screen.getByTestId("lesson-tile-1");
    expect(tile1).toHaveTextContent("1");
    expect(tile1).toHaveAttribute("href", `/cartilla/teacher/crm/${classId}/${studentId}/1`);
    expect(tile1).toHaveAttribute("title", expect.stringContaining("Completada"));
    
    const tile2 = screen.getByTestId("lesson-tile-2");
    expect(tile2).toHaveTextContent("2");
    expect(tile2).toHaveAttribute("title", expect.stringContaining("En progreso"));
    
    const tile3 = screen.getByTestId("lesson-tile-3");
    expect(tile3).toHaveTextContent("3");
    expect(tile3).toHaveAttribute("title", expect.stringContaining("Sin empezar"));
  });

  it("adds the assigned indicator and title suffix for assigned lessons", () => {
    const tiles: LessonTileState[] = [
      { lessonNumber: 1, status: "not_started", assigned: true },
    ];
    
    render(<LessonTileGrid tiles={tiles} classId={classId} studentId={studentId} />);
    
    const tile = screen.getByTestId("lesson-tile-1");
    expect(tile).toHaveAttribute("title", expect.stringContaining("(asignada)"));
    
    // Check that the assigned indicator span is rendered
    // Since it's just an empty span with classes, we can query it by its class name
    const indicator = tile.querySelector("span.bg-\\[\\#0284c7\\]");
    expect(indicator).not.toBeNull();
  });
  
  it("renders the correct class names based on status", () => {
    const tiles: LessonTileState[] = [
      { lessonNumber: 1, status: "completed", assigned: false },
      { lessonNumber: 2, status: "in_progress", assigned: false },
      { lessonNumber: 3, status: "not_started", assigned: false },
    ];
    
    render(<LessonTileGrid tiles={tiles} classId={classId} studentId={studentId} />);
    
    expect(screen.getByTestId("lesson-tile-1")).toHaveClass("bg-[#8da47e]");
    expect(screen.getByTestId("lesson-tile-2")).toHaveClass("bg-[#e8c874]");
    expect(screen.getByTestId("lesson-tile-3")).toHaveClass("bg-stone-100");
  });
});

describe("LessonTileLegend", () => {
  it("renders all legend items", () => {
    render(<LessonTileLegend />);
    
    expect(screen.getByText("Completada")).toBeInTheDocument();
    expect(screen.getByText("En progreso")).toBeInTheDocument();
    expect(screen.getByText("Sin empezar")).toBeInTheDocument();
    expect(screen.getByText("Asignada")).toBeInTheDocument();
  });
});