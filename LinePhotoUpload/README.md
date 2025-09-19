# Line 照片上傳助理

這是一個 Line 機器人，可以幫助您將照片自動上傳到 Google Drive 並進行管理。

## 功能特色

### 📸 上傳模式
- **原始模式**：上傳原始高解析度照片（未經 Line 壓縮）
- **一般模式**：使用 Line 壓縮版本（較小檔案）

### 🗂 資料夾管理
- 透過對話建立新資料夾
- 設定當前上傳目標資料夾

### 🏷 檔案命名
- 自定義命名規則
- 自動批次命名（如：旅遊_001.jpg, 旅遊_002.jpg）

### 💬 對話指令
```
建立資料夾：[資料夾名稱]     # 建立新資料夾
設定命名：[命名前綴]         # 設定照片命名規則
原始模式                    # 切換為原始高畫質模式
一般模式                    # 切換為 Line 壓縮模式
狀態                       # 查看當前設定
```

## 安裝與設定

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定環境變數
複製 `.env.example` 為 `.env` 並填入相關設定：
```bash
cp .env.example .env
```

### 3. Line Bot 設定
1. 前往 [Line Developers Console](https://developers.line.biz/)
2. 建立新的 Channel
3. 取得 Channel Access Token 和 Channel Secret

### 4. Google Drive API 設定
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 啟用 Google Drive API
3. 建立憑證並取得 Client ID、Client Secret
4. 設定重新導向 URI

### 5. 啟動應用程式
```bash
# 開發模式
npm run dev

# 正式運行
npm start
```

## 專案結構
```
Line照片上傳助理/
├── src/
│   ├── app.js              # 主程式
│   ├── controllers/        # 控制器
│   ├── services/          # 服務層
│   └── middleware/        # 中介軟體
├── config/                # 配置檔案
├── utils/                 # 工具函數
├── temp/                  # 臨時檔案
└── uploads/              # 上傳暫存
```

## 作者
cyclone-tw

## 授權
MIT License