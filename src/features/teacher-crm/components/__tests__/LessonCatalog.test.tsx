/**
 * @vitest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonCatalog } from "../LessonCatalog";
import { CATALOG } from "@/lib/lesson-catalog";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, ...props }: {
    to: string;
    params?: { n: string };
    children: React.ReactNode;
  }) => <a href={params ? to.replace("$n", params.n) : to} {...props}>{children}</a>,
}));

describe("teacher lesson catalog", () => {
  it("shows every canonical lesson with matching workbook, presenter, and guide routes", () => {
    render(<LessonCatalog />);
    expect(CATALOG).toHaveLength(24);
    expect(screen.getAllByRole("link", { name: "Ver Cuaderno" })).toHaveLength(24);
    expect(screen.getAllByRole("link", { name: "Proyectar" })).toHaveLength(24);
    expect(screen.getAllByRole("link", { name: "Guía del profesor" })).toHaveLength(24);

    for (const lesson of [CATALOG[0]!, CATALOG[6]!, CATALOG[23]!]) {
      const card = screen.getByText(`Lección ${lesson.n}`).closest("div.group") as HTMLElement | null;
      expect(card).not.toBeNull();
      expect(within(card!).getByRole("link", { name: "Ver Cuaderno" }).getAttribute("href"))
        .toBe(`/cartilla/teacher/paginas/${lesson.n}`);
      expect(within(card!).getByRole("link", { name: "Proyectar" }).getAttribute("href"))
        .toBe(`/cartilla/presentar/${lesson.n}`);
      expect(within(card!).getByRole("link", { name: "Guía del profesor" }).getAttribute("href"))
        .toBe(`/cartilla/teacher/guia/${lesson.n}`);
    }
  });
});
