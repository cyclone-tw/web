import { google } from 'googleapis';
import { config } from '../config/config.js';
import express from 'express';

const app = express();

// OAuth2 客戶端設定
const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

// 設定授權範圍
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive'
];

// 取得授權 URL
function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // 強制顯示同意畫面以取得 refresh token
  });
  return authUrl;
}

// 處理授權回調
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);

      console.log('\n🎉 Google OAuth 授權成功！');
      console.log('📋 請將以下 Refresh Token 複製到 .env 檔案中：');
      console.log('═'.repeat(80));
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('═'.repeat(80));

      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>✅ Google Drive 授權成功！</h2>
            <p>請回到命令行查看你的 Refresh Token</p>
            <p>然後將它加入到 .env 檔案中</p>
            <p>完成後可以關閉這個頁面</p>
          </body>
        </html>
      `);

      // 5秒後關閉伺服器
      setTimeout(() => {
        console.log('\n✨ 授權流程完成，伺服器已關閉');
        process.exit(0);
      }, 5000);

    } catch (error) {
      console.error('❌ 取得 Token 失敗:', error);
      res.status(500).send('授權失敗');
    }
  } else {
    res.status(400).send('未收到授權碼');
  }
});

// 啟動授權流程
console.log('🚀 啟動 Google Drive 授權流程...');
console.log('📱 請在瀏覽器中打開以下連結進行授權：');
console.log('═'.repeat(80));
console.log(getAuthUrl());
console.log('═'.repeat(80));
console.log('💡 授權時請使用你的**學校 Google 帳號**');
console.log('⏳ 等待授權...\n');

app.listen(3000, () => {
  console.log('🌐 授權伺服器已啟動在 http://localhost:3000');
});