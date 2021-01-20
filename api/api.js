const puppeteer = require("puppeteer");
const uuid = require("uuid");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { json } = require("express");
const { CronJob } = require("cron");

const url = "https://www.newyorker.com/cartoons/random";

const server = express();
server.use(
  cors({
    origin: "*",
    methods: "GET",
    allowedHeaders: "Content-Type",
  })
);

const fetchDoodles = new CronJob("* * * * *", async () => {
  console.log("Fetching new Remote Jobs...");
  await scraper.run();
});
//You need to explicity start the cronjob
fetchDoodles.start();

server.get("/api", (req, res) => {
  console.log("heyyyyy");
  res.send({ hey: "yo" });
});

function scraper() {
  (async () => {
    const browser = await puppeteer.launch({
      headless: true, // Set to false while development
      defaultViewport: null,
      args: [
        "--no-sandbox",
        "--incognito",
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

      const doodle1 = await page.$("#cartoon.vertical-center");
      const img = await page.$("#cartoonimg");

      const doodle1name = uuid.v4();
      const location = `../assets/${doodle1name}.png`;
      await doodle1.screenshot({
        path: `${location}`,
        omitBackground: true,
      });

      await page.click("#new-cartoon");
      const doodle2 = await page.$("#cartoon");
      const doodle2name = uuid.v4();
      const location2 = `../assets/2${doodle2name}.png`;
      await page.waitForTimeout(1000);
      await doodle2.screenshot({
        path: `${location2}`,
        omitBackground: true,
      });

      await browser.close();
    } catch (error) {
      console.log(error);
    }
  })();
}

module.exports = server;
