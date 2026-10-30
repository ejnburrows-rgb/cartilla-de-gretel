import {test,expect} from '@playwright/test';
async function openBook(page: import('@playwright/test').Page,n:number){
 await page.addInitScript(n=>localStorage.setItem('cartilla.workbook-reader-page.v1',String(n)),n);
 await page.goto('/cartilla/cuaderno');
 await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page',String(n));
}
test('page7 splits8plus8 and keeps validated original cell when changing screens',async({page})=>{
 await openBook(page,7);
 await expect(page.locator('.fp-ix-cell')).toHaveCount(8);
 await page.getByRole('button',{name:'abanico',exact:true}).click();
 await expect(page.getByRole('button',{name:'abanico',exact:true})).toHaveAttribute('aria-pressed','true');
 const next=page.getByRole('button',{name:'Dibujos 9-16'});
 await expect(next).toBeEnabled({timeout:15000});await next.click();
 await expect(page.locator('.fp-ix-cell')).toHaveCount(8);
 await expect(page.getByRole('button',{name:'uno',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Dibujos 1-8'}).click();
 await expect(page.getByRole('button',{name:'abanico',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','7');
});
test('page8 wider workbook preserves8targets, example and held draw, not two clicks',async({page})=>{
 await openBook(page,8);
 const stage=page.locator('.am-direct-pencil__stage');
 const center=stage.locator('.am-direct-pencil__center');
 const target=stage.getByRole('button',{name:'alas',exact:true});
 await expect(stage.locator('.am-direct-pencil__target')).toHaveCount(8);
 await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(1);
 await center.click();await target.click();
 await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(1);
 const a=await center.boundingBox(),b=await target.boundingBox();if(!a||!b)throw Error('Missing workbook letter/picture');
 expect(a.x+a.width).toBeLessThan(b.x);
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await page.mouse.up();
 await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(2);
});
test('page8 release outside cancels, hovering cannot restart, keyboard remains usable',async({page})=>{
 await openBook(page,8);const stage=page.locator('.am-direct-pencil__stage'),center=stage.locator('.am-direct-pencil__center'),target=stage.getByRole('button',{name:'alas',exact:true});
 const a=await center.boundingBox();if(!a)throw Error('Letter missing');
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(2,2);await page.mouse.up();await target.hover();
 await expect(stage.locator('.am-direct-pencil__active-line')).toHaveCount(0);
 await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(1);
 await center.focus();await page.keyboard.press('Enter');await target.focus();await page.keyboard.press('Enter');
 await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(2);
});
test('page8 touch release reaches original target in phone layout',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});const page=await context.newPage();
 await page.goto('http://127.0.0.1:8790');await page.evaluate(()=>localStorage.setItem('cartilla.workbook-reader-page.v1','8'));await page.goto('http://127.0.0.1:8790/cartilla/cuaderno');
 const stage=page.locator('.am-direct-pencil__stage');const a=await stage.locator('.am-direct-pencil__center').boundingBox(),b=await stage.getByRole('button',{name:'alas',exact:true}).boundingBox();if(!a||!b)throw Error('Phone targets missing');
 const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(stage.locator('.am-direct-pencil__line-group')).toHaveCount(2);await context.close();
});
