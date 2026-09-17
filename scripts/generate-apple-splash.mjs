import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SIZES = [
  { cssW: 440, cssH: 956, dpr: 3, w: 1320, h: 2868 },
  { cssW: 430, cssH: 932, dpr: 3, w: 1290, h: 2796 },
  { cssW: 428, cssH: 926, dpr: 3, w: 1284, h: 2778 },
  { cssW: 414, cssH: 896, dpr: 3, w: 1242, h: 2688 },
  { cssW: 402, cssH: 874, dpr: 3, w: 1206, h: 2622 },
  { cssW: 393, cssH: 852, dpr: 3, w: 1179, h: 2556 },
  { cssW: 390, cssH: 844, dpr: 3, w: 1170, h: 2532 },
  { cssW: 375, cssH: 812, dpr: 3, w: 1125, h: 2436 },
  { cssW: 414, cssH: 736, dpr: 3, w: 1242, h: 2208 },
  { cssW: 414, cssH: 896, dpr: 2, w: 828, h: 1792 },
  { cssW: 375, cssH: 667, dpr: 2, w: 750, h: 1334 },
];

const island = fs
  .readFileSync("public/illustrations/loading-illustration.png")
  .toString("base64");

function html() {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@800&family=Noto+Sans+KR:wght@800&display=swap" rel="stylesheet" />
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
    }
    .splash {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      padding-bottom: 12vh;
    }
    img {
      width: 212px;
      height: 124px;
      object-fit: contain;
      display: block;
    }
    p {
      margin: 15px 0 0;
      width: 100%;
      padding: 0 24px;
      box-sizing: border-box;
      text-align: center;
      font-family: Nunito, "Noto Sans KR", sans-serif;
      font-size: 14px;
      line-height: 33px;
      font-weight: 800;
      color: #4A4A4A;
    }
  </style>
</head>
<body>
  <div class="splash">
    <img src="data:image/png;base64,${island}" alt="" />
    <p>소희 &amp; 준형 in JEJU...</p>
  </div>
</body>
</html>`;
}

const outDir = "public/splash";
const browser = await chromium.launch();

for (const size of SIZES) {
  const page = await browser.newPage({
    viewport: { width: size.cssW, height: size.cssH },
    deviceScaleFactor: size.dpr,
  });
  await page.setContent(html(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluate((img) => (img.complete ? undefined : img.decode()));
  const out = path.join(outDir, `apple-splash-${size.w}x${size.h}.png`);
  await page.screenshot({ path: out, type: "png" });
  await page.close();
  console.log("wrote", out);
}

fs.copyFileSync(path.join(outDir, "apple-splash-1170x2532.png"), path.join(outDir, "apple-splash.png"));
await browser.close();
console.log("ok");
