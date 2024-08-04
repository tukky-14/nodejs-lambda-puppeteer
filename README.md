### Puppeteer を Lambda で使用する

##### npm インストール

```bash
npm i @sparticuz/chromium
npm i puppeteer-core
```

##### zip 圧縮

```bash
rm archive.zip
zip -r archive.zip ./
```

##### S3 アップロード

```
aws s3 cp /path/to/your/archive_name.zip s3://your-bucket-name/your-directory/archive_name.zip
```

##### 指定の Lambda 関数の更新

```
aws lambda update-function-code --function-name my-function --s3-bucket my-s3-bucket --s3-key my-lambda-source.zip
```

### 参考資料

[Lambda で puppeteer を動かす](https://zenn.dev/ispec_inc/articles/lambda-puppeteer)
