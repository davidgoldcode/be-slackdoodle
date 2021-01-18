const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");

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
  try {
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    await page.click("body");

    await page.waitForTimeout(10000);

    const doodle = await page.$("#cartoon");
    const img = await page.$("#cartoonimg");

    const doodlename = uuid.v4();
    const location = `./assets/${doodlename}.png`;
    await doodle.screenshot({
      path: path.join(__dirname, `${location}`),
      omitBackground: true,
    });
    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
