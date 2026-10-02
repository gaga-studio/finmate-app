import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

// VITE_API_URL을 비운 시연 서버에서 실행한다. 데이터나 화면은 편집하지 않는다.
const baseURL = process.env.CAPTURE_URL ?? 'http://localhost:5177';
const output = fileURLToPath(new URL('../docs/assets/screens/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [size, viewport] of [
    ['desktop', { width: 1440, height: 1050 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    for (const route of size === 'desktop' ? ['my'] : ['my', 'feed', 'insights', 'missions', 'diary']) {
      await page.goto(`${baseURL}/${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.querySelectorAll('img')].every(img => img.complete));
      // 숫자와 입장 애니메이션이 끝난 실제 화면을 촬영한다.
      await page.waitForTimeout(1300);
      const name = route === 'my' ? `demo-${size}.png` : `${route}-${size}.png`;
      await page.screenshot({ path: `${output}${name}`, fullPage: true });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
