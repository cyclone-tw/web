# 🚀 Line 照片上傳助理 - 快速設定指南

## ⏱️ 5分鐘快速部署

### 📋 準備清單
- [ ] Line 開發者帳號
- [ ] Google Cloud Platform 帳號
- [ ] Railway 帳號
- [ ] GitHub 帳號

### 🎯 Step 1: Line Bot 設定 (2分鐘)

1. **建立 Line Bot**
   - 到 [Line Developers Console](https://developers.line.biz/console/)
   - 建立 Messaging API Channel
   - 記下 `Channel Access Token` 和 `Channel Secret`

2. **重要設定**
   - ✅ 關閉 "Auto-reply messages"
   - ✅ 開啟 "Use webhook"

### 🔑 Step 2: Google API 設定 (2分鐘)

1. **Google Cloud Console**
   - 到 [Google Cloud Console](https://console.cloud.google.com/)
   - 建立新專案 → 啟用 Google Drive API
   - 建立 OAuth 2.0 桌面應用程式憑證

2. **取得憑證**
   ```bash
   git clone https://github.com/your-username/LinePhotoUpload.git
   cd LinePhotoUpload
   npm install
   node utils/getRefreshToken.js
   ```
   記下取得的三個值：Client ID、Client Secret、Refresh Token

### 🚂 Step 3: Railway 部署 (1分鐘)

1. **部署**
   - 到 [Railway](https://railway.app/)
   - 連接 GitHub → 部署專案

2. **環境變數** (複製貼上)
   ```
   LINE_CHANNEL_ACCESS_TOKEN=你的Line Token
   LINE_CHANNEL_SECRET=你的Line Secret
   GOOGLE_CLIENT_ID=你的Google Client ID
   GOOGLE_CLIENT_SECRET=你的Google Client Secret
   GOOGLE_REFRESH_TOKEN=你的Refresh Token
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   PORT=3000
   ```

3. **設定 Webhook**
   - 複製 Railway URL
   - 回 Line Console 設定: `https://your-app.up.railway.app/webhook`

### ✅ Step 4: 測試 (30秒)

1. **健康檢查**: 訪問 `https://your-app.up.railway.app/health`
2. **Line Bot**: 掃 QR Code 加機器人 → 輸入 `hi`

---

## 🔄 更換 Google 帳號 (1分鐘)

```bash
# 1. 重新執行憑證工具，用新帳號登入
node utils/getRefreshToken.js

# 2. 更新 Railway 環境變數
GOOGLE_REFRESH_TOKEN=新的Token值

# 3. 重新部署 (自動)
```

## 🆘 遇到問題？

| 問題 | 解決方法 |
|------|----------|
| 機器人不回應 | 檢查 Railway 日誌，確認環境變數 |
| 無法上傳照片 | 重新取得 Google Refresh Token |
| 資料夾看不到 | 確認 Google 帳號權限正確 |

**詳細說明請參考 [README.md](./README.md)**

---

💡 **提示**: 整個設定過程大約5-10分鐘，主要時間花在等待各服務的頁面載入。