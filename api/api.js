const puppeteer = require("puppeteer");

const url = "https://www.newyorker.com/cartoons/random";

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // Set to false while development
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--start-maximized", // Start in maximized state
    ],
  });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  await page.click("body");

  await page.waitForTimeout(10000);

  const doodle = await page.$("#cartoon");
  await doodle.screenshot({ path: "doodle.png", omitBackground: true });
  await browser.close();
})();
