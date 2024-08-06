// index.js
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');

exports.handler = async (event, context) => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const path = '/tmp/output.pdf';

    // フロントから送信されたHTMLを取得
    const htmlContent = event.body; // Assuming event.body contains the HTML string

    // HTMLコンテンツをページに設定
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // ページをPDFに変換
    await page.pdf({ path, format: 'A4' });

    // 取得したPDFをbase64にエンコードし、返却する
    const data = fs.readFileSync(path).toString('base64');

    await browser.close();

    return {
        statusCode: 200,
        body: JSON.stringify({ data }),
    };
};
