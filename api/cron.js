const { CronJob } = require("cron");
const scraper = require("./api");

console.log("Scheduler Started");
const fetchDoodles = new CronJob("* * * * *", async () => {
  console.log("Fetching new Remote Jobs...");
  await scraper.run();
});
//You need to explicity start the cronjob
fetchDoodles.start();
