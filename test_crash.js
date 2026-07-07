const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE [' + msg.type() + ']:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER PAGEERROR:', error.message, error.stack));

  console.log('Navigating to http://localhost:3000/en/admin/gallery');
  try {
    await page.goto('http://localhost:3000/en/admin/gallery', { waitUntil: 'domcontentloaded', timeout: 180000 });
  } catch(e) {
    console.log('Navigation error:', e.message);
  }

  console.log('Waiting for 10 seconds to catch any delayed errors...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Done.');
})();
