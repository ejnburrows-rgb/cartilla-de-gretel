import { test, expect, Page } from "@playwright/test";

test.use({
  video: "on",
});

async function setupGame(page: Page) {
  await page.goto("/cartilla/juego/payaso-chano-ss");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByLabel("Instrucciones del juego")).toBeVisible();
}

async function assertJuggleMovement(page: Page, durationMs: number) {
  const clown = page.locator('[data-testid="chano-clown-whole"]');
  const b0 = page.locator('[data-testid="chano-ball-ma"]');
  const b1 = page.locator('[data-testid="chano-juggle-ball-1"]');
  const b2 = page.locator('[data-testid="chano-juggle-ball-2"]');
  const capLeft = page.locator('[data-testid="chano-hand-cap-left"]');
  const capRight = page.locator('[data-testid="chano-hand-cap-right"]');

  await clown.waitFor();
  await b0.waitFor();
  await capLeft.waitFor();

  const clownBox = await clown.boundingBox();
  expect(clownBox).not.toBeNull();

  const apexBandStart = clownBox!.y + clownBox!.height * 0.38;
  const apexBandEnd = clownBox!.y + clownBox!.height * 0.45;

  let samples = 0;
  let b0Traveled = 0;
  let b1Traveled = 0;
  let b2Traveled = 0;
  let b0Last = await b0.boundingBox();
  let b1Last = await b1.boundingBox();
  let b2Last = await b2.boundingBox();

  let overlapHand = false;
  let reachedApex = false;

  const start = Date.now();

  while (Date.now() - start < durationMs) {
    await page.waitForTimeout(50);
    const b0Now = await b0.boundingBox();
    const b1Now = await b1.boundingBox();
    const b2Now = await b2.boundingBox();
    const cL = await capLeft.boundingBox();
    const cR = await capRight.boundingBox();

    if (b0Now && b0Last) b0Traveled += Math.hypot(b0Now.x - b0Last.x, b0Now.y - b0Last.y);
    if (b1Now && b1Last) b1Traveled += Math.hypot(b1Now.x - b1Last.x, b1Now.y - b1Last.y);
    if (b2Now && b2Last) b2Traveled += Math.hypot(b2Now.x - b2Last.x, b2Now.y - b2Last.y);

    b0Last = b0Now;
    b1Last = b1Now;
    b2Last = b2Now;

    // check apex
    if (b0Now && b0Now.y >= apexBandStart && b0Now.y <= apexBandEnd) reachedApex = true;
    if (b1Now && b1Now.y >= apexBandStart && b1Now.y <= apexBandEnd) reachedApex = true;
    if (b2Now && b2Now.y >= apexBandStart && b2Now.y <= apexBandEnd) reachedApex = true;

    // check hand overlap
    const overlaps = (b: any, cap: any) => {
      if (!b || !cap) return false;
      return !(b.x > cap.x + cap.width ||
               b.x + b.width < cap.x ||
               b.y > cap.y + cap.height ||
               b.y + b.height < cap.y);
    };
    if (overlaps(b0Now, cL) || overlaps(b0Now, cR) ||
        overlaps(b1Now, cL) || overlaps(b1Now, cR) ||
        overlaps(b2Now, cL) || overlaps(b2Now, cR)) {
      overlapHand = true;
    }

    samples++;
  }

  expect(samples).toBeGreaterThan(10);

  // They should move substantially over a hand-to-hand arc relative to clown size
  // A minimum travel distance per ball. The clown size is relatively big, so travel should be e.g., > clownBox.width.
  expect(b0Traveled).toBeGreaterThan(clownBox!.width);
  expect(b1Traveled).toBeGreaterThan(clownBox!.width);
  expect(b2Traveled).toBeGreaterThan(clownBox!.width);

  expect(overlapHand).toBe(true);
  expect(reachedApex).toBe(true);
}

test.describe("Chano Juggle Juggling Proofs", () => {

  test("Phone 390x844: Assert Juggle movement", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setupGame(page);
    await assertJuggleMovement(page, 10000);
  });

  test("Desktop 1280x720: Assert Juggle movement", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await setupGame(page);
    await assertJuggleMovement(page, 6000);
});

  test("Reduced motion mode: assert static balls", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setupGame(page);

    const clown = page.locator('[data-testid="chano-clown-whole"]');
    const b0 = page.locator('[data-testid="chano-juggle-ball-0"]');
    const b1 = page.locator('[data-testid="chano-juggle-ball-1"]');
    const b2 = page.locator('[data-testid="chano-juggle-ball-2"]');
    const capLeft = page.locator('[data-testid="chano-hand-cap-left"]');
    const capRight = page.locator('[data-testid="chano-hand-cap-right"]');

    await clown.waitFor();
    await b0.waitFor();
    await capLeft.waitFor();

    let samples = 0;
    let b0Last = await b0.boundingBox();
    let b1Last = await b1.boundingBox();
    let b2Last = await b2.boundingBox();

    let overlapHand = true;

    const start = Date.now();

    while (Date.now() - start < 2000) {
      await page.waitForTimeout(50);
      const b0Now = await b0.boundingBox();
      const b1Now = await b1.boundingBox();
      const b2Now = await b2.boundingBox();
      const cL = await capLeft.boundingBox();
      const cR = await capRight.boundingBox();

      if (b0Now && b0Last) expect(b0Now).toEqual(b0Last);
      if (b1Now && b1Last) expect(b1Now).toEqual(b1Last);
      if (b2Now && b2Last) expect(b2Now).toEqual(b2Last);

      b0Last = b0Now;
      b1Last = b1Now;
      b2Last = b2Now;

      const overlaps = (b: any, cap: any) => {
        if (!b || !cap) return false;
        return !(b.x > cap.x + cap.width ||
                 b.x + b.width < cap.x ||
                 b.y > cap.y + cap.height ||
                 b.y + b.height < cap.y);
      };

      const b0Overlaps = overlaps(b0Now, cL) || overlaps(b0Now, cR);
      const b1Overlaps = overlaps(b1Now, cL) || overlaps(b1Now, cR);
      const b2Overlaps = overlaps(b2Now, cL) || overlaps(b2Now, cR);

      if (!b0Overlaps || !b1Overlaps || !b2Overlaps) {
        overlapHand = false;
      }

      samples++;
    }

    expect(samples).toBeGreaterThan(10);
    expect(overlapHand).toBe(true);

    await page.screenshot({ path: "docs/proofs/chano-juggle-20261020/reduced-motion.png" });
  });

  test("Drag: assert dragging ball out and resuming cascade", async ({ page }) => {
    await setupGame(page);

    const b0 = page.locator('[data-testid="chano-ball-ma"]');
    const b1 = page.locator('[data-testid="chano-juggle-ball-1"]');
    const b2 = page.locator('[data-testid="chano-juggle-ball-2"]');

    await b0.waitFor();
    await b1.waitFor();
    await b2.waitFor();

    const box0 = await b0.boundingBox();
    expect(box0).not.toBeNull();

    let b1Last = await b1.boundingBox();
    let b2Last = await b2.boundingBox();

    let b1Traveled = 0;
    let b2Traveled = 0;

    // Start drag
    await page.mouse.move(box0!.x + box0!.width / 2, box0!.y + box0!.height / 2);
    await page.mouse.down();

    // Drag it away
    await page.mouse.move(0, 0, { steps: 20 });

    // While holding it, ensure other balls are moving
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(50);
      const b1Now = await b1.boundingBox();
      const b2Now = await b2.boundingBox();
      if (b1Now && b1Last) b1Traveled += Math.hypot(b1Now.x - b1Last.x, b1Now.y - b1Last.y);
      if (b2Now && b2Last) b2Traveled += Math.hypot(b2Now.x - b2Last.x, b2Now.y - b2Last.y);
      b1Last = b1Now;
      b2Last = b2Now;
    }

    expect(b1Traveled).toBeGreaterThan(50);
    expect(b2Traveled).toBeGreaterThan(50);

    // Drop it
    await page.mouse.up();

    // Ensure the ball rejoins the cascade by moving again
    let b0Traveled = 0;
    let b0LastAfterDrop = await b0.boundingBox();

    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(50);
      const b0Now = await b0.boundingBox();
      if (b0Now && b0LastAfterDrop) {
        b0Traveled += Math.hypot(b0Now.x - b0LastAfterDrop.x, b0Now.y - b0LastAfterDrop.y);
      }
      b0LastAfterDrop = b0Now;
    }

    expect(b0Traveled).toBeGreaterThan(50);
  });
});
