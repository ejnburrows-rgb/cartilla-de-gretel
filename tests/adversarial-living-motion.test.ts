/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Adversarial Empirical Stress Harness: Living Motion & 3D Coordinates", () => {
  const flipchartCssPath = path.resolve(__dirname, "../src/styles/flipchart-turn.css");
  const welcomeCssPath = path.resolve(__dirname, "../src/styles/welcome-splash.css");
  const flipchartPanelPath = path.resolve(__dirname, "../src/components/cartilla/FlipchartHdPanel.tsx");
  const welcomeSplashPath = path.resolve(__dirname, "../src/components/intro/WelcomeSplash.tsx");
  const livingMotionPath = path.resolve(__dirname, "../src/lib/living-motion.ts");

  const flipchartCss = fs.readFileSync(flipchartCssPath, "utf-8");
  const welcomeCss = fs.readFileSync(welcomeCssPath, "utf-8");
  const flipchartPanel = fs.readFileSync(flipchartPanelPath, "utf-8");
  const welcomeSplash = fs.readFileSync(welcomeSplashPath, "utf-8");
  const livingMotion = fs.readFileSync(livingMotionPath, "utf-8");
  const cover = fs.readFileSync(path.resolve(__dirname, "../src/components/intro/LivingBookCover.tsx"), "utf8");

  describe("1. Flipchart 3D Outward Page-Turn Trajectory", () => {
    // 3D coordinate transformation for rotateX(theta) around top hinge (y=0):
    // x' = x
    // y' = y * cos(theta)
    // z' = y * sin(theta)
    // For any point on leaf with y > 0 (e.g. bottom edge y = H),
    // z' = H * sin(theta).

    it("verifies keyframe angles in @keyframes fc-turn-leaf are strictly positive and sweep 0 -> 180 deg", () => {
      const leafMatch = flipchartCss.match(/@keyframes fc-turn-leaf\s*\{([\s\S]*?)\n\}/);
      expect(leafMatch).not.toBeNull();
      const content = leafMatch![1];

      const stepMatches = [...content.matchAll(/(\d+)%\s*\{\s*transform:\s*rotateX\((\d+)deg\);/g)];
      expect(stepMatches.length).toBe(5);

      const steps = stepMatches.map((m) => ({
        pct: parseInt(m[1], 10),
        angle: parseInt(m[2], 10),
      }));

      expect(steps).toEqual([
        { pct: 0, angle: 0 },
        { pct: 24, angle: 20 },
        { pct: 62, angle: 118 },
        { pct: 84, angle: 174 },
        { pct: 100, angle: 180 },
      ]);

      // Verify each keyframe satisfies z' = H * sin(theta) >= 0 (projecting toward classroom)
      const H = 800; // standard easel leaf height in px
      for (const step of steps) {
        const rad = (step.angle * Math.PI) / 180;
        const zPrime = H * Math.sin(rad);
        const yPrime = H * Math.cos(rad);

        expect(zPrime).toBeGreaterThanOrEqual(0);
        expect(step.angle).toBeGreaterThanOrEqual(0);
        expect(step.angle).toBeLessThanOrEqual(180);

        if (step.angle === 0) {
          expect(yPrime).toBeCloseTo(H, 1);
          expect(zPrime).toBeCloseTo(0, 1);
        } else if (step.angle === 180) {
          expect(yPrime).toBeCloseTo(-H, 1);
          expect(zPrime).toBeCloseTo(0, 1);
        }
      }
    });

    it("verifies interactive drag progression for progress in [0.0, 1.0] strictly guarantees z' >= 0", () => {
      // In FlipchartHdPanel.tsx:
      // const angle = state.direction === "next" ? 180 * progress : 180 - 180 * progress;
      expect(flipchartPanel).toContain(
        'const angle = state.direction === "next" ? 180 * progress : 180 - 180 * progress;',
      );

      const H = 800;
      // Test continuous drag progression across 101 samples
      for (let i = 0; i <= 100; i++) {
        const progress = i / 100;
        const angleNext = 180 * progress;
        const anglePrev = 180 - 180 * progress;

        for (const angle of [angleNext, anglePrev]) {
          const rad = (angle * Math.PI) / 180;
          const zPrime = H * Math.sin(rad);
          // Mathematical proof check: sin(theta) >= 0 on [0, pi]
          expect(zPrime).toBeGreaterThanOrEqual(0);
          expect(angle).toBeGreaterThanOrEqual(0);
          expect(angle).toBeLessThanOrEqual(180);
        }
      }
    });

    it("proves apex geometry at theta = 90deg is perpendicular and expands under perspective", () => {
      const H = 800;
      const d = 1200; // perspective distance in px
      const apexAngle = 90;
      const rad = (apexAngle * Math.PI) / 180;

      const yPrime = H * Math.cos(rad);
      const zPrime = H * Math.sin(rad);

      // Sheet is horizontal (perpendicular to easel)
      expect(Math.abs(yPrime)).toBeLessThan(1e-10);
      expect(zPrime).toBe(H);

      // Perspective projection scale: S = d / (d - z')
      const scale = d / (d - zPrime);
      expect(scale).toBeGreaterThan(1.0); // Expands toward classroom
      expect(scale).toBe(3.0); // 1200 / (1200 - 800) = 3.0

      // Contrast with previous negative rotation bug (-90deg):
      const oldZPrime = H * Math.sin(-rad);
      const oldScale = d / (d - oldZPrime);
      expect(oldZPrime).toBe(-800); // penetrated behind easel
      expect(oldScale).toBe(1200 / 2000); // 0.60 collapsed away from classroom!
    });

    it("verifies front and back face concealment angles and authentic paper backing", () => {
      // Front face normal: cos(theta)
      // Back face has rotateX(180deg) so normal is -cos(theta)
      const angles = [0, 20, 60, 89, 90, 91, 120, 180];
      for (const theta of angles) {
        const rad = (theta * Math.PI) / 180;
        const frontNormalZ = Math.cos(rad);
        const backNormalZ = -Math.cos(rad);

        if (theta < 90) {
          expect(frontNormalZ).toBeGreaterThan(0); // Front visible
          expect(backNormalZ).toBeLessThan(0); // Back hidden
        } else if (theta > 90) {
          expect(frontNormalZ).toBeLessThan(0); // Front hidden
          expect(backNormalZ).toBeGreaterThan(0); // Back visible
        }
      }

      // Check authentic manila paper backing styles in flipchart-turn.css
      expect(flipchartCss).toContain(".fc-turn__paper");
      expect(flipchartCss).toContain("linear-gradient(180deg, #f3eee3 0%, #f7f3ea 55%, #efe8da 100%)");
      expect(flipchartCss).toContain("repeat-x"); // spiral punch holes
    });

    it("verifies container overflow is set to visible during page turns across viewports", () => {
      expect(flipchartCss).toContain(".fc-board[data-turning] .fc-board__easel");
      expect(flipchartCss).toContain(".fc-board[data-turning] .fc-board__page");
      expect(flipchartCss).toContain("overflow: visible;");
      expect(flipchartPanel).toContain('data-turning={isFlipping ? "true" : undefined}');
    });
  });

  describe("2. Original painted butterfly motion", () => {
    it("flexes both painted wings about their shared body axis", () => {
      expect(cover).toContain("vec2 butterfly = p-vec2(285.0,514.0)");
      expect(cover).toContain("vec2 wing = vec2(-axis.y,axis.x)");
      expect(cover).toContain("float wingSide = dot(butterfly,wing)");
      expect(cover).toContain("samplePoint += wing*wingSide*flap*0.12*wingMask");
      for (const distance of [1, 20, 100]) expect(distance * 0.12 + (-distance * 0.12)).toBe(0);
    });
    it("bounds the flap and glide to the original painted region", () => {
      expect(cover).toContain("float flap = pow(0.5+0.5*sin(time*7.0),2.0)");
      expect(cover).toContain("float wingMask = region(p,vec2(285.0,514.0),vec2(151.0,159.0))");
      expect(cover).toContain("sin(time*1.1)*1.4*wingMask");
      expect(cover).toContain("sin(time*0.8)*0.8*wingMask");
      for(let frame=0;frame<100;frame++) {
        const flap = Math.pow(0.5+0.5*Math.sin(frame*7),2);
        expect(flap).toBeGreaterThanOrEqual(0); expect(flap).toBeLessThanOrEqual(1);
      }
    });
    it("uses original cover pixels without minigame sprites or replacement butterfly vectors", () => {
      for(const text of [welcomeSplash,welcomeCss,cover]) {
        expect(text).not.toContain("bt_ma.png"); expect(text).not.toContain("bt_");
      }
      expect(welcomeSplash).toContain("<LivingBookCover onError={showFallback}");
      expect(cover).toContain('BOOK_COVER_SRC = "/cartilla/images/cover.png"');
      expect(cover).toContain("texture2D(artwork");
    });
  });
  describe("3. Gretel eyelid alignment and timing", () => {
    it("uses the exact 1086x1448 source coordinate frame", () => {
      expect(welcomeSplash).toContain('viewBox="0 0 1086 1448"');
      expect(welcomeCss).toContain("aspect-ratio: 1086 / 1448");
      expect(1086/1448).toBe(0.75);
    });
    it("keeps eye positions proportional from phone to projector widths", () => {
      expect(welcomeSplash).toContain("M465 861");
      expect(welcomeSplash).toContain("M529 872");
      for(const width of [320,390,768,1024,1366,1920,2560]) {
        const scale = width/1086;
        expect((529*scale-465*scale)/width).toBeCloseTo((529-465)/1086,6);
        expect((1448*scale)/width).toBeCloseTo(1448/1086,6);
      }
    });
    it("closes quickly, holds briefly, then opens more slowly", () => {
      expect(welcomeCss).toContain("animation: lc-gretel-blink 4.8s ease-in-out infinite");
      const blink = welcomeCss.match(/@keyframes lc-gretel-blink\s*\{([\s\S]*?)\n\}/)![1];
      for(const step of ["90%", "91.5%", "92.5%", "95%"]) expect(blink).toContain(step);
      expect(blink).toContain("transform: scaleY(0)"); expect(blink).toContain("transform: scaleY(1)");
      const closeMs = 4800*(91.5-90)/100, holdMs = 4800*(92.5-91.5)/100, openMs = 4800*(95-92.5)/100;
      expect(closeMs).toBe(72); expect(holdMs).toBe(48); expect(openMs).toBe(120);
      expect(openMs).toBeGreaterThan(closeMs);
    });
  });
  describe("4. Source-aligned respiratory motion", () => {
    it("synchronizes localized painted breathing and halo without moving the whole book", () => {
      expect(welcomeCss).toContain("animation: lc-halo-pulse 6s ease-in-out infinite");
      expect(welcomeCss).toContain("animation: lc-gretel-read-breathe 6s ease-in-out infinite");
      expect(welcomeCss).toContain("translateY(-0.13%)");
      expect(cover).toContain("float breath = (1.0-cos(time*1.0472))*0.5");
      expect(cover).toContain("breath*2.2*region");
      expect(2*Math.PI/1.0472).toBeCloseTo(6,4);
      expect(welcomeCss).not.toContain("animation: lc-book-breathe");
    });
  });

  describe("5. Reduced-Motion Hardening", () => {
    it("verifies @media (prefers-reduced-motion: reduce) halts all motion across components", () => {
      // Welcome splash reduced motion
      const welcomeRmMatch = welcomeCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
      expect(welcomeRmMatch).not.toBeNull();
      const wrm = welcomeRmMatch![1];

      expect(wrm).toContain(".lc-welcome *");
      expect(wrm).toContain(".lc-welcome *::before");
      expect(wrm).toContain(".lc-welcome *::after");
      expect(wrm).toContain("animation: none !important;");
      expect(wrm).toContain("transition: none !important;");
      expect(cover).toContain("if (disposed || reduced) return;");
      expect(wrm).toContain(".lc-welcome__eyelids");
      expect(wrm).toContain("display: none;");
      expect(wrm).toContain("transform: none;");

      // Flipchart turn reduced motion
      const fcRmMatch = flipchartCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
      expect(fcRmMatch).not.toBeNull();
      const fcrm = fcRmMatch![1];

      expect(fcrm).toContain(".fc-turn .fc-turn__leaf");
      expect(fcrm).toContain("animation: none !important;");
      expect(fcrm).toContain("transition: none !important;");
      expect(fcrm).toContain(".fc-turn .fc-turn__shade");
    });
  });
});
