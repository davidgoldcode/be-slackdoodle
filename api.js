const puppeteer = require("puppeteer");
const uuid = require("uuid");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const schedule = require("node-schedule");
const cloudinary = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const url = "https://www.newyorker.com/cartoons/random";

const server = express();

// server.use(
//   cors({
//     origin: "*",
//     methods: "GET",
//     allowedHeaders: "Content-Type",
//   })
// );

// server.get("/api", (req, res) => {
//   console.log("heyyyyy");
//   res.send({ hey: "yo" });
// });

// schedule.scheduleJob("23 * * *", function () {
//   scraper();
// });

function uploadScreenshot(path) {
  const b64 = `data:image/png;base64,${path}`;

  const uploadPreset = {
    tags: "New Yorker",
    folder: "doodles",
  };

  cloudinary.v2.uploader.upload(b64, uploadPreset, function (err, image) {
    if (err) {
      console.warn(err);
    } else {
      console.log(image);
    }
  });
}

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

    const doodle = await page.$("#cartoon.vertical-center");
    const img = await page.$("#cartoonimg");

    const doodleName = uuid.v4();
    const location = `./assets/${doodleName}.png`;
    const screenshot = await doodle.screenshot({
      encoding: "base64",
      omitBackground: true,
    });

    if (screenshot) {
      return uploadScreenshot(screenshot);
    }
  } catch (error) {
    console.log(error);
  }

  await browser.close();
})();

module.exports = server;
