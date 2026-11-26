# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-pages7-8.spec.ts >> page8 touch release reaches original target in phone layout
- Location: tests\e2e\book-pages7-8.spec.ts:44:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:8790/
Call log:
  - navigating to "http://127.0.0.1:8790/", waiting until "load"

```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | async function openBook(page: import('@playwright/test').Page,n:number){
  3  |  await page.addInitScript(n=>localStorage.setItem('cartilla.workbook-reader-page.v1',String(n)),n);
  4  |  await page.goto('/cartilla/cuaderno');
  5  |  await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page',String(n));
  6  | }
  7  | test('page7 splits8plus8 and keeps validated original cell when changing screens',async({page})=>{
  8  |  await openBook(page,7);
  9  |  await expect(page.locator('.fp-ix-cell')).toHaveCount(8);
  10 |  await page.getByRole('button',{name:'abanico',exact:true}).click();
  11 |  await expect(page.getByRole('button',{name:'abanico',exact:true})).toHaveAttribute('aria-pressed','true');
  12 |  const next=page.getByRole('button',{name:'Dibujos 9-16'});
  13 |  await expect(next).toBeEnabled({timeout:15000});await next.click();
  14 |  await expect(page.locator('.fp-ix-cell')).toHaveCount(8);
  15 |  await expect(page.getByRole('button',{name:'uno',exact:true})).toBeVisible();
  16 |  await page.getByRole('button',{name:'Dibujos 1-8'}).click();
  17 |  await expect(page.getByRole('button',{name:'abanico',exact:true})).toHaveAttribute('aria-pressed','true');
  18 |  await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','7');
  19 | });
  20 | test('page8 wider workbook preserves8targets, example and held draw, not two clicks',async({page})=>{
  21 |  await openBook(page,8);
  22 |  const stage=page.locator('.am-direct-pencil__stage');
  23 |  const center=stage.locator('.am-direct-pencil__center');
  24 |  const target=stage.getByRole('button',{name:'alas',exact:true});
  25 |  await expect(stage.locator('.am-direct-pencil__target')).toHaveCount(8);
  26 |  await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(1);
  27 |  await center.click();await target.click();
  28 |  await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(1);
  29 |  const a=await center.boundingBox(),b=await target.boundingBox();if(!a||!b)throw Error('Missing workbook letter/picture');
  30 |  expect(a.x+a.width).toBeLessThan(b.x);
  31 |  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
  32 |  await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await page.mouse.up();
  33 |  await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(2);
  34 | });
  35 | test('page8 release outside cancels, hovering cannot restart, keyboard remains usable',async({page})=>{
  36 |  await openBook(page,8);const stage=page.locator('.am-direct-pencil__stage'),center=stage.locator('.am-direct-pencil__center'),target=stage.getByRole('button',{name:'alas',exact:true});
  37 |  const a=await center.boundingBox();if(!a)throw Error('Letter missing');
  38 |  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(2,2);await page.mouse.up();await target.hover();
  39 |  await expect(stage.locator('.am-direct-pencil__active-line')).toHaveCount(0);
  40 |  await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(1);
  41 |  await center.focus();await page.keyboard.press('Enter');await target.focus();await page.keyboard.press('Enter');
  42 |  await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(2);
  43 | });
  44 | test('page8 touch release reaches original target in phone layout',async({browser})=>{
  45 |  const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});const page=await context.newPage();
> 46 |  await page.goto('http://127.0.0.1:8790');await page.evaluate(()=>localStorage.setItem('cartilla.workbook-reader-page.v1','8'));await page.goto('http://127.0.0.1:8790/cartilla/cuaderno');
     |             ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:8790/
  47 |  const stage=page.locator('.am-direct-pencil__stage');const a=await stage.locator('.am-direct-pencil__center').boundingBox(),b=await stage.getByRole('button',{name:'alas',exact:true}).boundingBox();if(!a||!b)throw Error('Phone targets missing');
  48 |  const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  49 |  await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(2);await context.close();
  50 | });
  51 | 
```