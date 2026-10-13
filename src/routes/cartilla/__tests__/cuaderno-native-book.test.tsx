import { cleanup, render, screen } from "@testing-library/react";
import { lazy, Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  lazyRouteComponent: (load: () => Promise<Record<string, React.ComponentType>>, name: string) =>
    lazy(async () => ({ default: (await load())[name] })),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

import { Route } from "../cuaderno";

const Book = Route.options.component!;
async function Workbook() {
  render(
    <Suspense fallback={<p>Cargando</p>}>
      <Book />
    </Suspense>,
  );
  await screen.findByTestId("corner-next");
}

beforeEach(() => {
  window.scrollTo = vi.fn() as never;
  localStorage.clear();
});
afterEach(cleanup);

describe("complete book (/cartilla/cuaderno) — owner decision 2026-10-13", () => {
  it("shows one native digital page at a time, never a raw scan or a spread", async () => {
    await Workbook();
    expect(document.querySelector(".native-lesson-viewer")).not.toBeNull();
    expect(document.querySelectorAll("[data-native-page]")).toHaveLength(1);
    expect(
      document.querySelector("[data-physical-book-reader], [data-testid='physical-book-reader']"),
    ).toBeNull();
    expect(
      document.querySelector("[data-workbook-source], [data-reconstructed-master]"),
    ).toBeNull();
    const scans = [...document.querySelectorAll("img")].filter((img) =>
      /art\/source\/workbook|images\/source/.test(img.getAttribute("src") ?? ""),
    );
    expect(scans).toHaveLength(0);
  });

  it("has no Gretel companion at the bottom of the book", async () => {
    await Workbook();
    expect(screen.queryByTestId("book-companion-anchor")).toBeNull();
    expect(
      document.querySelector("[data-testid='gretel-presence'], .gretel-avatar, .gretel-mascot"),
    ).toBeNull();
  });

  it("lets the reader browse forward without finishing the page", async () => {
    await Workbook();
    const next = screen.getByTestId("corner-next");
    expect(next.getAttribute("data-locked")).toBeNull();
  });
});
