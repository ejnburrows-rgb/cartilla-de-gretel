import "@testing-library/jest-dom";
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { Downloads } from "../Downloads";

afterEach(() => {
  cleanup();
});

describe("Downloads component", () => {
  it("renders the Downloads component with correct title and description", () => {
    render(<Downloads />);

    // Check main title
    const title = screen.getByText("Descargar el libro");
    expect(title).toBeInTheDocument();

    // Check subtitle/description
    const subtitle = screen.getByText("Acceso rápido al PDF oficial de la cartilla.");
    expect(subtitle).toBeInTheDocument();
  });

  it("renders the PDF download link correctly", () => {
    render(<Downloads />);

    // Find the link
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();

    // Check link properties
    expect(link).toHaveAttribute("href", "/book/book.pdf");
    expect(link).toHaveAttribute("download", "La_cartilla_de_Gretel.pdf");

    // Check inner text and elements
    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByText("Libro del alumno completo, listo para leer o descargar")).toBeInTheDocument();
    expect(screen.getByText("↓ Descargar")).toBeInTheDocument();
  });
});
