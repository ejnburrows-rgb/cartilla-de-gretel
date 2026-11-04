import { afterEach, describe, expect, it, vi } from "vitest";
import {
  enhanceLivingArtImage,
  isLivingArtSource,
} from "../living-art-runtime";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("living art runtime", () => {
  it("recognizes faithful Cartilla art but not UI chrome", () => {
    expect(isLivingArtSource("/cartilla/art/faithful/vocal-o/oso.webp")).toBe(true);
    expect(isLivingArtSource("/cartilla/art/faithful/leccion-1/pajaro.webp")).toBe(true);
    expect(isLivingArtSource("/icons/app-192.png")).toBe(false);
    expect(isLivingArtSource("/art/hd/garden/base.jpg")).toBe(false);
  });

  it("upgrades a legacy plain image into live interactive art", () => {
    const img = document.createElement("img");
    img.src = "/cartilla/art/faithful/vocal-o/oruga.webp";
    document.body.appendChild(img);

    enhanceLivingArtImage(img);

    expect(img.dataset.livingRuntime).toBe("true");
    expect(img.dataset.livingProfile).toMatch(/breathe|float|sway/);
    expect(img.classList.contains("living-runtime-art")).toBe(true);

    img.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(img.classList.contains("living-runtime-art--reacting")).toBe(true);
  });

  it("uses the real authored blink frame for mapped animals", () => {
    vi.useFakeTimers();
    const img = document.createElement("img");
    img.src = "/cartilla/art/faithful/vocal-o/oso.webp";
    document.body.appendChild(img);

    enhanceLivingArtImage(img);

    expect(img.dataset.trueBlinkFrame).toBe(
      "/cartilla/art/faithful/vocal-o/oso-blink.webp",
    );

    vi.advanceTimersToNextTimer();
    expect(img.src).toContain("oso-blink.webp");

    vi.advanceTimersToNextTimer();
    expect(img.src).toContain("oso.webp");
  });


  it("reconfigures a reused image node when its faithful source changes", () => {
    vi.useFakeTimers();
    const img = document.createElement("img");
    img.src = "/cartilla/art/faithful/vocal-o/oso.webp";
    document.body.appendChild(img);

    enhanceLivingArtImage(img);
    expect(img.dataset.trueBlinkFrame).toContain("oso-blink.webp");

    img.src = "/cartilla/art/faithful/leccion-7-m/mono.webp";
    enhanceLivingArtImage(img);

    expect(img.dataset.livingSource).toBe(
      "/cartilla/art/faithful/leccion-7-m/mono.webp",
    );
    expect(img.dataset.trueBlinkFrame).toBeUndefined();
    expect(img.src).toContain("mono.webp");
  });

  it("does not double-animate images already owned by LivingIllustration", () => {
    const wrapper = document.createElement("span");
    wrapper.className = "living-illustration";
    const img = document.createElement("img");
    img.src = "/cartilla/art/faithful/vocal-o/oso.webp";
    wrapper.appendChild(img);
    document.body.appendChild(wrapper);

    enhanceLivingArtImage(img);

    expect(img.dataset.livingRuntime).toBeUndefined();
    expect(img.classList.contains("living-runtime-art")).toBe(false);
  });
});
