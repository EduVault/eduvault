//@ts-check
const { webkit } = require('playwright');

const test = async () => {
  const browser = await webkit.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.goto('https://example.localhost/');

  await browser.close();
};

(async () => test())();
