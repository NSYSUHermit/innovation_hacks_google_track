import fs from 'fs';
import { exec } from 'child_process';

// 預設讀取 my-custom-job.json，也可以透過指令參數傳入其他檔名
const fileName = process.argv[2] || 'my-custom-job.json';

try {
  if (!fs.existsSync(fileName)) {
    throw new Error(`File not found: ${fileName}`);
  }

  // 1. 讀取 JSON 檔案
  const rawData = fs.readFileSync(fileName, 'utf-8');
  const jobData = JSON.parse(rawData); // 驗證並轉換為物件

  // 為了確保這筆資料排在儀表板「最上面」，我們將日期強制押在假資料的最新進度 (2026/04/04)
  // 小時與分鐘則抓取你執行腳本的當下時間，保留真實感
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  jobData.appliedTime = `2026/04/04 ${hh}:${min}`;

  // 2. 將資料編碼成 Base64 Token (與 Extension 的邏輯完全一致)
  const encodedStr = encodeURIComponent(JSON.stringify(jobData));
  const token = Buffer.from(encodedStr).toString('base64');
  const url = `http://localhost:3000/#syncToken=${token}`;

  console.log(`\n✅ Successfully packed [${fileName}]`);
  console.log(`🔗 Magic Link generated!`);
  console.log(`🚀 Opening browser to import data...\n`);

  // 3. 自動在瀏覽器中打開這串網址
  const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${startCmd} "${url}"`);

} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
}