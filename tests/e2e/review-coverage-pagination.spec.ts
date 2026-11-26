import { expect, test } from "@playwright/test";

test("large artwork and audio queues remain reachable and unverified audio cannot be accepted", async ({page}) => {
  const issues = Array.from({length:65},(_,i)=>({id:`art${i}`,classification:i===64?"RECHECK":"MISSING",page:"7",problem:"fixture",remedy:"fixture"}));
  const rows = Array.from({length:85},(_,i)=>({id:`audio${i}`,classification:"MISSING",script:`Fixture ${i}`,category:"fixture",where:"fixture",note:"not verified"}));
  await page.route("**/review/artwork-board.json", r=>r.fulfill({json:{summary:{total:"65"},issues}}));
  await page.route("**/review/audio-board.json", r=>r.fulfill({json:{summary:{total:"85"},rows}}));
  await page.goto("/revision",{waitUntil:"domcontentloaded"});
  await expect(page.locator("#art-art64")).toHaveCount(0);
  await page.getByRole("button",{name:"Show more artwork"}).click();
  await expect(page.locator("#art-art64")).toBeVisible();
  await expect(page.getByText("Showing 65 of 65 artwork entries.")).toBeVisible();
  await expect(page.getByText("Fixture 84",{exact:true})).toHaveCount(0);
  await page.getByRole("button",{name:"Show more audio"}).click();
  await expect(page.getByText("Fixture 84",{exact:true})).toBeVisible();
  await expect(page.getByText("Showing 85 of 85 audio entries.")).toBeVisible();
  await expect(page.getByRole("button",{name:"Accept original"})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Accept alternate"})).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem("cartilla:owner-review:v1"))).toBeNull();
});

test("original-audio acceptance requires the exact source and verified transcript", async ({page}) => {
  const rows = [
    {id:"verified",classification:"MISSING",script:"Verified fixture",category:"fixture",where:"fixture",note:"fixture",file:"/review/Gretel_558674_Original.m4a",source:"Gretel_558674_Original.m4a",transcriptVerified:"true"},
    {id:"wrong-source",classification:"MISSING",script:"Wrong-source fixture",category:"fixture",where:"fixture",note:"fixture",file:"/review/Gretel_558674_Original.m4a",source:"different.m4a",transcriptVerified:"true"},
    {id:"unverified",classification:"MISSING",script:"Unverified fixture",category:"fixture",where:"fixture",note:"fixture",file:"/review/Gretel_558674_Original.m4a",source:"Gretel_558674_Original.m4a",transcriptVerified:"false"},
    {id:"wrong-path",classification:"MISSING",script:"Wrong-path fixture",category:"fixture",where:"fixture",note:"fixture",file:"/review/different.m4a",source:"Gretel_558674_Original.m4a",transcriptVerified:"true"},
  ];
  await page.route("**/review/audio-board.json",r=>r.fulfill({json:{summary:{total:"4"},rows}}));
  await page.goto("/revision",{waitUntil:"domcontentloaded"});
  const row = (text:string)=>page.locator(".orh-audio").filter({hasText:text});
  await expect(row("Verified fixture").getByRole("button",{name:"Accept original"})).toHaveCount(1);
  await expect(row("Wrong-source fixture").getByRole("button",{name:"Accept original"})).toHaveCount(0);
  await expect(row("Unverified fixture").getByRole("button",{name:"Accept original"})).toHaveCount(0);
  await expect(row("Wrong-path fixture").getByRole("button",{name:"Accept original"})).toHaveCount(0);
  await expect(row("Wrong-source fixture").locator("audio")).toHaveCount(0);
  await expect(row("Wrong-path fixture").locator("audio")).toHaveCount(0);
  await expect(row("Unverified fixture").locator("audio")).toHaveCount(1); // listening for transcript review only
  await expect(page.getByRole("button",{name:"Accept alternate"})).toHaveCount(0);
});
