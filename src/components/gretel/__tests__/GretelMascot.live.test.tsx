import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GretelMascot } from "../GretelMascot";

describe("GretelMascot live character wrapper", () => {
  it("renders the shared live Gretel engine instead of a static pose image", () => {
    render(<GretelMascot pose="welcome" text="Hola" />);
    expect(screen.getByTestId("gretel-live-avatar")).toBeTruthy();
    expect(screen.queryByAltText(/Gretel - welcome/i)).toBeNull();
  });
});
