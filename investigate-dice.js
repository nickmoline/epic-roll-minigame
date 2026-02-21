import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('1. Navigating to http://localhost:5175/');
  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'tests/screenshots/dice-01-setup.png', fullPage: true });
  console.log('   Screenshot: dice-01-setup.png');
  
  console.log('\n2. Looking for Begin Combat button...');
  const beginButton = page.getByRole('button', { name: 'Begin Combat' });
  await beginButton.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/dice-02-combat-screen.png', fullPage: true });
  console.log('   Screenshot: dice-02-combat-screen.png');
  
  console.log('\n3. Opening Dice Tray...');
  const diceTrayButton = page.locator('button:has-text("Dice Tray")');
  const trayButtonExists = await diceTrayButton.count() > 0;
  console.log(`   Dice Tray button exists: ${trayButtonExists}`);
  
  if (trayButtonExists) {
    await diceTrayButton.click();
    console.log('   Clicked Dice Tray button');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/dice-03-tray-opened.png', fullPage: true });
    console.log('   Screenshot: dice-03-tray-opened.png');
  }
  
  console.log('\n4. Looking for Roll button...');
  const rollButtons = await page.locator('button:has-text("Roll")').count();
  console.log(`   Found ${rollButtons} Roll button(s)`);
  
  if (rollButtons > 0) {
    await page.locator('button:has-text("Roll")').first().click();
    console.log('   Clicked first Roll button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/dice-04-after-roll.png', fullPage: true });
    console.log('   Screenshot: dice-04-after-roll.png');
  }
  
  console.log('\n5. Investigating #dice-tray...');
  const diceTray = page.locator('#dice-tray');
  const exists = await diceTray.count() > 0;
  console.log(`   #dice-tray exists: ${exists}`);
  
  if (exists) {
    const boundingBox = await diceTray.boundingBox();
    console.log(`   Bounding box:`, boundingBox);
    
    const styles = await diceTray.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        width: computed.width,
        height: computed.height,
        position: computed.position,
        overflow: computed.overflow,
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
      };
    });
    console.log('   Computed styles:', styles);
    
    const canvas = page.locator('#dice-tray canvas');
    const canvasExists = await canvas.count() > 0;
    console.log(`   Canvas inside #dice-tray: ${canvasExists}`);
    
    if (canvasExists) {
      const canvasStyles = await canvas.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          actualWidth: el.width,
          actualHeight: el.height,
          styleWidth: computed.width,
          styleHeight: computed.height,
          position: computed.position,
          top: computed.top,
          left: computed.left,
          zIndex: computed.zIndex,
          visibility: computed.visibility,
          display: computed.display,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
          }
        };
      });
      console.log('   Canvas details:', canvasStyles);
    }
    
    const parent = page.locator('#dice-tray').locator('..');
    const parentClass = await parent.getAttribute('class');
    console.log(`   Parent class: ${parentClass}`);
    
    if (parentClass && parentClass.includes('parchment-panel')) {
      const parentStyles = await parent.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          overflow: computed.overflow,
          position: computed.position,
          height: computed.height,
        };
      });
      console.log('   Parent (parchment-panel) styles:', parentStyles);
    }
  }
  
  await page.screenshot({ path: 'tests/screenshots/dice-05-investigation.png', fullPage: true });
  console.log('\n   Final screenshot: dice-05-investigation.png');
  
  console.log('\n6. Checking console errors...');
  page.on('console', msg => console.log('   BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('   ERROR:', error.message));
  
  await page.waitForTimeout(2000);
  
  console.log('\n=== Investigation complete ===');
  await browser.close();
})();
