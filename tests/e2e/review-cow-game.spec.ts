import { expect, test } from "@playwright/test";

test.use({ video: "on" });
test.setTimeout(120_000);
for (const d of [{name:"mobile-emulated",width:390,height:844,touch:true},{name:"desktop",width:1366,height:768,touch:false}]) {
  test.describe(d.name, () => {
    test.use({viewport:{width:d.width,height:d.height},hasTouch:d.touch,isMobile:d.touch});
    test("cow game plays wrong, all five right, completion and reset", async ({page}, info) => {
      const errors:string[]=[];
      page.on("pageerror", e=>errors.push(e.message));
      await page.goto("/cartilla/juego/cow-game-m", {waitUntil:"domcontentloaded"});
      await expect(page.getByRole("main",{name:"Juego de la vaca"})).toBeVisible();
      await page.screenshot({path:info.outputPath("initial.png")});
      const broken = await page.locator("img").evaluateAll(imgs=>imgs.filter(i=>i.complete && i.naturalWidth===0).map(i=>i.getAttribute("src")));
      expect(broken).toEqual([]);
      await page.getByRole("button",{name:"Vaca mu"}).click();
      await page.getByRole("button",{name:"Casilla mo"}).click();
      await expect(page.getByRole("status")).toHaveText("Inténtalo otra vez", {timeout:5000});
      await expect(page.getByRole("status")).toHaveText("",{timeout:6000});
      for(const syllable of ["mu","mo","me","ma","mi"]){
        await page.getByRole("button",{name:`Vaca ${syllable}`}).click();
        await page.getByRole("button",{name:`Casilla ${syllable}`}).click();
        if(syllable !== "mi"){
          await expect(page.getByRole("status")).toHaveText("¡Muy bien!",{timeout:6000});
          await expect(page.getByRole("status")).toHaveText("",{timeout:4000});
          await page.waitForTimeout(600); // Remaining return walk after status clears.
        }
      }
      await expect(page.getByRole("dialog",{name:"Juego completado"})).toBeVisible({timeout:6000});
      await page.screenshot({path:info.outputPath("completed.png")});
      await page.getByRole("button",{name:"Jugar otra vez"}).click();
      await expect(page.getByRole("dialog",{name:"Juego completado"})).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  });
}

test("reset during an active delivery does not resurrect the previous move", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/cartilla/juego/cow-game-m", {waitUntil:"domcontentloaded"});
  const card = page.locator('.cg-card').filter({hasText:/^mu$/});
  const original = await card.getAttribute("style");
  await page.getByRole("button",{name:"Vaca mu"}).click();
  await page.getByRole("button",{name:"Casilla mu"}).click();
  await page.getByRole("button",{name:"Ajustes"}).click();
  await page.getByRole("button",{name:"Empezar de nuevo"}).click();
  await page.waitForTimeout(4800);
  expect(await card.getAttribute("style")).toBe(original);
  await expect(page.getByRole("status")).toHaveText("");
});

for (const kind of ["wrong feedback", "correct return"] as const) {
  test(`reset during ${kind} cancels remaining callbacks`, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto("/cartilla/juego/cow-game-m", {waitUntil:"domcontentloaded"});
    const card = page.locator('.cg-card').filter({hasText:/^mu$/});
    const original = await card.getAttribute("style");
    await page.getByRole("button",{name:"Vaca mu"}).click();
    await page.getByRole("button",{name: kind === "wrong feedback" ? "Casilla mo" : "Casilla mu"}).click();
    await expect(page.getByRole("status")).toHaveText(kind === "wrong feedback" ? "Inténtalo otra vez" : "¡Muy bien!", {timeout:6000});
    await page.getByRole("button",{name:"Ajustes"}).click();
    await page.getByRole("button",{name:"Empezar de nuevo"}).click();
    await page.waitForTimeout(4800);
    expect(await card.getAttribute("style")).toBe(original);
    await expect(page.getByRole("status")).toHaveText("");
  });
}
