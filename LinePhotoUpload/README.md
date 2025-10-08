# Line 照片上傳助理

一個全功能的 Line Bot，可以自動將照片上傳到 Google Drive 並進行智能資料夾管理。

## 🌟 功能特色

### 📁 階層式資料夾導航
- **一層一層瀏覽** - 不會一次顯示所有資料夾，避免混亂
- **智能導航** - 可以進入資料夾瀏覽或直接設為上傳目標
- **路徑顯示** - 清楚顯示當前位置（如：根目錄 > 旅行記錄 > 2024日本）

### 📸 智能照片上傳
- **自動上傳** - 傳送照片即可自動上傳到指定資料夾
- **批次處理** - 支援一次上傳多張照片
- **模式切換** - 原始高畫質 vs Line 壓縮版本

### 🎛️ 用戶友善操作
- **數字選擇** - 主要操作只需輸入數字，簡單直覺
- **防卡關設計** - 任何時候輸入 "bye" 都能回到主選單
- **即時狀態** - 隨時查看當前設定和上傳統計

### 💬 對話指令

#### 主要操作
```
hi                    # 顯示主選單
bye                   # 任何時候回到主選單
1, 2, 3...           # 數字選擇操作
```

#### 進階指令（舊版相容）
```
建立資料夾：[名稱]      # 直接建立資料夾
設定命名：[前綴]        # 設定照片命名規則
原始模式               # 切換為原始高畫質模式
一般模式               # 切換為 Line 壓縮模式
狀態                  # 查看當前設定
說明                  # 顯示完整說明
```

## 📱 使用方法

### 基本操作流程

1. **開始使用**
   ```
   輸入: hi
   ```

2. **主選單選項**
   ```
   1️⃣ 瀏覽資料夾 - 階層式瀏覽資料夾
   2️⃣ 創建新資料夾 - 在當前位置創建
   3️⃣ 查看狀態 - 顯示當前設定
   4️⃣ 說明 - 查看詳細使用方式
   ```

3. **資料夾操作流程**
   - 瀏覽資料夾 → 選擇資料夾 → 選擇操作
   - **進入瀏覽**：繼續往下一層
   - **設為上傳目標**：直接開始上傳照片

4. **照片上傳**
   - 設定好上傳目標後，直接傳送照片即可
   - 支援批次上傳多張照片

5. **緊急退出**
   ```
   輸入: bye (任何時候都可以回到主選單)
   ```

## 🚀 部署指南

### 前置需求

- Line Developer Account
- Google Cloud Platform Account
- Railway Account (推薦)
- GitHub Account

### 步驟 1: Line Bot 設定

1. **創建 Line Bot**
   - 前往 [Line Developers Console](https://developers.line.biz/console/)
   - 創建新的 Provider 和 Messaging API Channel
   - 取得 `Channel Access Token` 和 `Channel Secret`

2. **關閉自動回覆**
   - 在 Messaging API 設定中關閉 "Auto-reply messages"
   - 啟用 "Use webhook"

### 步驟 2: Google Drive API 設定

1. **創建 Google Cloud 專案**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 創建新專案或選擇現有專案
   - 啟用 Google Drive API

2. **創建 OAuth 2.0 憑證**
   - 進入「API和服務」→「憑證」
   - 創建 OAuth 2.0 用戶端ID
   - 應用程式類型：桌面應用程式
   - 下載 JSON 憑證檔案

### 步驟 3: 取得 Google API 憑證

1. **本機執行憑證取得工具**
   ```bash
   git clone https://github.com/your-username/LinePhotoUpload.git
   cd LinePhotoUpload
   npm install
   node utils/getRefreshToken.js
   ```

2. **完成 OAuth 流程**
   - 按照提示在瀏覽器中完成授權
   - 取得並記錄以下資訊：
     - Client ID
     - Client Secret
     - Refresh Token

### 步驟 4: Railway 部署

1. **部署到 Railway**
   - 前往 [Railway](https://railway.app/)
   - 連接 GitHub 帳號並部署專案

2. **設定環境變數**
   在 Railway Dashboard 設定：
   ```
   LINE_CHANNEL_ACCESS_TOKEN=你的Line Token
   LINE_CHANNEL_SECRET=你的Line Secret
   GOOGLE_CLIENT_ID=你的Google Client ID
   GOOGLE_CLIENT_SECRET=你的Google Client Secret
   GOOGLE_REFRESH_TOKEN=你的Refresh Token
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   UPLOAD_FOLDER_ID=你的Google Drive上傳資料夾ID
   PORT=3000
   ```

   **如何取得 UPLOAD_FOLDER_ID？**
   - 在 Google Drive 中開啟目標資料夾
   - 從網址列複製資料夾 ID（格式：`https://drive.google.com/drive/folders/【這串就是ID】`）
   - 例如：`1AbCdEfGhIjKlMnOpQrStUvWxYz`

3. **設定 Webhook URL**
   - 複製 Railway 提供的應用程式 URL
   - 回到 Line Developers Console
   - 設定 Webhook URL: `https://your-app.up.railway.app/webhook`

### 步驟 5: 測試部署

1. **健康檢查**：訪問 `https://your-app.up.railway.app/health`
2. **Line Bot 測試**：掃描 QR Code 加入機器人並測試功能

## 🔧 更換 Google 帳號指南

### 情境：要將照片上傳到不同的 Google 帳號

#### 方法 1: 重新取得憑證（推薦）

1. **在本機執行**
   ```bash
   node utils/getRefreshToken.js
   ```

2. **使用新帳號登入**
   - 在彈出的瀏覽器中登入新的 Google 帳號
   - 完成授權流程

3. **更新 Railway 環境變數**
   - 進入 Railway Dashboard → Variables
   - 更新憑證資訊：
     ```
     GOOGLE_CLIENT_ID=新的Client ID
     GOOGLE_CLIENT_SECRET=新的Client Secret
     GOOGLE_REFRESH_TOKEN=新的Refresh Token
     UPLOAD_FOLDER_ID=新的上傳資料夾ID
     ```

4. **重新部署**
   - Railway 會自動重新部署
   - 或手動觸發部署

#### 方法 2: 共用相同憑證（如果是同一個開發者）

如果新 Google 帳號也是你的，可以：
1. 在 Google Cloud Console 中將新帳號加入專案
2. 只需更新 `GOOGLE_REFRESH_TOKEN`
3. 其他憑證可以保持不變

### 驗證更換結果

1. **測試機器人**：輸入 `hi` → 選擇瀏覽資料夾
2. **檢查權限**：確認能看到新帳號的 Google Drive 資料夾
3. **測試上傳**：上傳一張測試照片確認目標正確

## 💰 費用預估

### Railway 費用
- **免費方案**: 500小時執行時間/月 + $5額度
- **Hobby 方案**: $5/月，包含自動休眠功能
- **預估使用量**: 500張照片/月 ≈ 4小時執行時間
- **預期費用**: $0-3/月（大多數情況下免費）

### Google Drive & Line Bot
- **Google Drive API**: 免費（一般個人使用量）
- **Line Bot**: 免費（Messaging API）

## 🔍 故障排除

### 常見問題

1. **機器人無回應**
   - 確認 Railway 服務正常運行
   - 檢查環境變數設定是否正確
   - 確認 Line Bot Webhook URL 設定正確

2. **Google Drive 上傳失敗**
   - 檢查 Google API 憑證是否有效
   - 確認 Refresh Token 未過期
   - 確認 Google Drive API 已啟用

3. **資料夾瀏覽異常**
   - 檢查 Google Drive 權限設定
   - 確認帳號有資料夾存取權限

### 調試工具

1. **健康檢查**: 訪問 `https://your-app.up.railway.app/health`
2. **Railway 日誌**: 在 Dashboard 查看即時錯誤日誌
3. **Line Webhook 狀態**: Line Developers Console 中可看到 webhook 呼叫狀態

## 🔄 更新與維護

### 檢查更新
```bash
git pull origin master
# 如有更新，推送到 Railway 會自動部署
git push
```

### 備份重要資料
- 定期備份 Railway 環境變數設定
- 記錄 Google API 憑證資訊
- 保存 Line Bot 設定資料

## 📊 使用統計

機器人會自動記錄：
- 照片上傳數量
- 資料夾創建記錄
- 使用者活動狀態

可在對話中輸入 `狀態` 查看個人使用統計。

## 🛠️ 專案結構

```
LinePhotoUpload/
├── src/
│   ├── app.js                    # 主應用程式
│   ├── controllers/
│   │   └── messageController.js  # 訊息處理控制器
│   └── services/
│       ├── googleDriveService.js # Google Drive 服務
│       ├── photoService.js       # 照片處理服務
│       └── userStateService.js   # 用戶狀態管理
├── config/
│   └── config.js                # 配置管理
├── utils/
│   └── getRefreshToken.js       # OAuth 憑證取得工具
├── temp/                        # 臨時檔案目錄
└── README.md                    # 專案說明文檔
```

## 📝 版本更新日誌

### v2.0.0 (2024年最新版)
- ✨ **階層式資料夾導航系統** - 一層一層瀏覽，不再混亂
- ✨ **數字選擇操作** - 簡化用戶操作流程
- ✨ **bye 指令** - 任何時候都能回到主選單，防卡關
- 🔧 **改善錯誤處理** - 更穩定的運行體驗
- 🔧 **優化資料夾列表邏輯** - 修正顯示所有資料夾的問題

### v1.0.0
- 🎉 基礎照片上傳功能
- 📁 基本資料夾管理
- 🏷️ 照片命名規則設定
- ⚙️ 上傳模式切換

## 🤝 技術支援

如果遇到問題：
1. 先查看本文檔的故障排除章節
2. 檢查 Railway Dashboard 中的日誌
3. 確認所有環境變數設定正確
4. 測試各個 API 服務的連線狀態

---

## 📞 聯絡資訊

- **開發者**: cyclone-tw
- **GitHub**: [LinePhotoUpload](https://github.com/cyclone-tw/web)
- **授權**: MIT License

🤖 **本專案由 Claude Code 協助開發完成**