import { expect, test } from "@playwright/test";
import { completeAndReplayCowGame } from "./support/cow-game";

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
      await completeAndReplayCowGame(page, info);
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}
