const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary");
const express = require("express");
require("dotenv").config();

const server = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const url = "https://www.newyorker.com/cartoons/random";

const uploadScreenshot = (path) => {
  const b64 = `data:image/png;base64,${path}`;

  const uploadPreset = {
    tags: "New Yorker",
    folder: "doodles",
  };

  const response = cloudinary.v2.uploader.upload(
    b64,
    uploadPreset,
    function (err, image) {
      if (err) {
        console.warn(err);
      } else {
        console.log(image);
      }
    }
  );

  return response;
};

const cartoonScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true, // Set to false while development
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--incognito",
      "--start-maximized",
      "--single-process",
      "--disable-gpu", // Start in maximized state
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
};

server.get("/api", (req, res) => {
  const img = cartoonScraper();
  res.send({ note: "Done!" });
});

module.exports = server;
