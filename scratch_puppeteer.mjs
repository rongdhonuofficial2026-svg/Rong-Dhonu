import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:3000/en/admin/cms', { waitUntil: 'networkidle0' });
    
    console.log('Page loaded successfully');
    await browser.close();
  } catch (error) {
    console.error('Puppeteer error:', error);
  }
})();
