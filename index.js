// index.js
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const fs = require("fs");

exports.handler = async (event, context) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  const path = "/tmp/screenshot.png";

  await page.goto("https://google.com");
  await page.screenshot({ path });

  // 取得したスクリーンショットをbase64にエンコードし、返却する
  const data = fs.readFileSync(path).toString("base64");

  // タイトルを取得する
  const title = await page.title();
  console.log("title:", title);

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ data, title }),
  };
};
