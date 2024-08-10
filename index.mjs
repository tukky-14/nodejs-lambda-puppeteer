// index.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const s3 = new S3Client({ region: 'ap-northeast-1' });

const createHtml = (body) => `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Noto Sans JP', sans-serif;
        }
    </style>
</head>
<body>
    ${body}
</body>
</html>
`;

export const handler = async (event) => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const tmpPath = '/tmp/output.pdf';
    const s3BucketName = process.env.AWS_S3_BUCKET; // ここをあなたのS3バケット名に置き換えてください
    const s3Key = `pdfs/output-${Date.now()}.pdf`;

    // フロントから送信されたHTMLを取得
    // const htmlContent = event.body; // Assuming event.body contains the HTML string
    const htmlContent = '<div class="bg-gray-200 text-xl py-2 px-1">Hello World!</div>';
    createHtml(htmlContent);

    // HTMLコンテンツをページに設定
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // ページをPDFに変換
    await page.pdf({ path: tmpPath, format: 'A4' });

    // S3にアップロードするためにPDFファイルを読み込む
    const fileContent = fs.readFileSync(tmpPath);

    // S3にアップロード
    const params = {
        Bucket: s3BucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/pdf',
    };

    try {
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        const fileUrl = `https://${s3BucketName}.s3.${s3.config.region}.amazonaws.com/${s3Key}`;

        await browser.close();

        return {
            statusCode: 200,
            body: JSON.stringify({ fileUrl }),
        };
    } catch (error) {
        console.error('Error uploading to S3:', error);
        await browser.close();
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload PDF to S3' }),
        };
    }
};
