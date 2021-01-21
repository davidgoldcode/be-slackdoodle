const puppeteer = require("puppeteer");
const uuid = require("uuid");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const schedule = require("node-schedule");
const cloudinary = require("cloudinary").v2;
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

function uploadScreenshot(screenshot) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {};
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(screenshot);
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

    const doodle1 = await page.$("#cartoon.vertical-center");
    const img = await page.$("#cartoonimg");

    const doodle1name = uuid.v4();

    // const cloudinaryOptions = {
    //   public_id: `toons/${doodle1name}`,
    // };

    const location = `${doodle1name}.png`;
    const screenshot = await doodle1.screenshot({
      encoding: "binary",
      omitBackground: true,
    });

    // await page.click("#new-cartoon");
    // const doodle2 = await page.$("#cartoon");
    // const doodle2name = uuid.v4();
    // const location2 = `./assets/2${doodle2name}.png`;
    // await page.waitForTimeout(1000);
    // await doodle2.screenshot({
    //   path: `${location2}`,
    //   omitBackground: true,
    // });

    if (screenshot) {
      return uploadScreenshot(screenshot);
    }
  } catch (error) {
    console.log(error);
  }

  await browser.close();
})();

module.exports = server;
