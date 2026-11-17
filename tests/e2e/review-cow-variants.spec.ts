import { expect, test } from "@playwright/test";

test.use({ video: "on" });
test.setTimeout(120_000);
for (const d of [{name:"phone-emulated",width:390,height:844,touch:true},{name:"desktop",width:1366,height:768,touch:false}]) {
  for (const variant of ["free", "guided"]) {
    test(`${variant} ${d.name}: wrong, retry, completion, replay`, async ({browser}, info) => {
      const context = await browser.newContext({viewport:{width:d.width,height:d.height},hasTouch:d.touch,isMobile:d.touch,recordVideo:{dir:info.outputPath("video"),size:{width:d.width,height:d.height}}});
      const page = await context.newPage();
      const errors:string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(`/cartilla/juego/cow-game-m?cow=${variant}`, {waitUntil:"domcontentloaded"});
      await expect(page.getByRole("main",{name:"Juego de la vaca"})).toBeVisible();
      const slot = page.getByRole("button",{name:"Casilla mo"});
      if (variant === "guided") {
        await expect(slot).toBeDisabled();
        await expect(page.locator('.cg-guide')).toHaveText("1. Elige una vaca");
      } else {
        await expect(slot).toBeEnabled();
        await slot.click();
        await expect(slot).toHaveClass(/cg-slot-sel/);
        await slot.click();
      }
      await page.screenshot({path:info.outputPath("initial.png")});
      await page.getByRole("button",{name:"Vaca mu"}).click();
      if (variant === "guided") {
        await expect(slot).toBeEnabled();
        await expect(page.locator('.cg-guide')).toHaveText("2. Elige una casilla");
      }
      await page.screenshot({path:info.outputPath("selected.png")});
      await slot.click();
      await expect(page.getByRole("status")).toHaveText("Inténtalo otra vez", {timeout:6000});
      await expect(page.getByRole("status")).toHaveText("",{timeout:6000});
      for(const syllable of ["mu","mo","me","ma","mi"]){
        await page.getByRole("button",{name:`Vaca ${syllable}`}).click();
        await page.getByRole("button",{name:`Casilla ${syllable}`}).click();
        if(syllable !== "mi"){
          await expect(page.getByRole("status")).toHaveText("¡Muy bien!",{timeout:6000});
          await expect(page.getByRole("status")).toHaveText("",{timeout:4000});
          await page.waitForTimeout(600);
        }
      }
      await expect(page.getByRole("dialog",{name:"Juego completado"})).toBeVisible({timeout:6000});
      await page.screenshot({path:info.outputPath("completed.png")});
      await page.getByRole("button",{name:"Jugar otra vez"}).click();
      await expect(page.getByRole("dialog",{name:"Juego completado"})).toHaveCount(0);
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}
