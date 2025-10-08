# 設定上傳資料夾 ID 指南

## 🎯 為什麼需要設定 UPLOAD_FOLDER_ID？

從 v2.2.0 版本開始，LineBot 使用**固定的資料夾 ID** 來定位上傳目標，這樣做的好處：

✅ **即使資料夾改名也能正常上傳** - Bot 透過 ID 識別，不受名稱影響
✅ **即使資料夾移動位置也能運作** - ID 是唯一且永久的
✅ **更穩定可靠** - 不會因為重複命名或搜尋錯誤而找錯資料夾

---

## 📋 設定步驟

### 步驟 1：取得資料夾 ID

1. **開啟 Google Drive**
   - 前往 [Google Drive](https://drive.google.com/)

2. **找到或建立上傳資料夾**
   - 如果已有資料夾，直接開啟
   - 如果還沒有，建立一個新資料夾（例如：「Line相片上傳助手」）

3. **複製資料夾 ID**
   - 開啟資料夾後，查看瀏覽器網址列
   - 網址格式：`https://drive.google.com/drive/folders/【這串就是ID】`
   - 複製最後一段英數字串

   **範例：**
   ```
   網址：https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
   資料夾 ID：1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```

### 步驟 2：設定環境變數

#### 在 Zeabur 設定

1. 登入 [Zeabur Dashboard](https://zeabur.com/)
2. 選擇你的 LinePhotoUpload 專案
3. 進入 **Variables** 或 **Environment Variables**
4. 新增變數：
   ```
   UPLOAD_FOLDER_ID=你剛複製的資料夾ID
   ```
5. 儲存後 Zeabur 會自動重新部署

#### 在 Railway 設定（如果你使用 Railway）

1. 登入 [Railway Dashboard](https://railway.app/)
2. 選擇你的專案
3. 進入 **Variables** 標籤
4. 新增變數：
   ```
   UPLOAD_FOLDER_ID=你剛複製的資料夾ID
   ```
5. Railway 會自動重新部署

#### 本機開發設定

在 `.env` 檔案中新增：
```
UPLOAD_FOLDER_ID=你的資料夾ID
```

### 步驟 3：驗證設定

1. **等待部署完成**（約 1-2 分鐘）

2. **測試 Line Bot**
   - 傳送照片到 Line Bot
   - 確認照片上傳到正確的資料夾

3. **檢查日誌**（可選）
   - 在 Zeabur/Railway Dashboard 查看日誌
   - 應該會看到：`使用固定上傳資料夾 ID: 1AbC...`

---

## 🔄 更換上傳資料夾

如果想要改變上傳目標資料夾：

1. **在 Google Drive 中建立或選擇新資料夾**
2. **複製新資料夾的 ID**
3. **更新環境變數 `UPLOAD_FOLDER_ID`**
4. **重新部署**

就這麼簡單！不需要修改程式碼。

---

## ✅ 優點總結

| 情境 | 舊版（用名稱搜尋） | 新版（用固定 ID） |
|------|-------------------|------------------|
| 資料夾改名 | ❌ 會建立新資料夾 | ✅ 正常運作 |
| 資料夾移動 | ❌ 找不到資料夾 | ✅ 正常運作 |
| 重複命名 | ❌ 可能找錯 | ✅ 精準定位 |
| 穩定性 | ⚠️ 依賴搜尋結果 | ✅ 固定不變 |

---

## ❓ 常見問題

### Q1: 我可以使用共用資料夾的 ID 嗎？
✅ 可以！只要你的 Google 帳號有該資料夾的編輯權限即可。

### Q2: 如果設定錯誤的 ID 會怎樣？
Bot 會在嘗試上傳時回報錯誤，修正 `UPLOAD_FOLDER_ID` 後重新部署即可。

### Q3: 可以動態切換上傳資料夾嗎？
目前版本使用單一固定資料夾。如需動態切換，可以考慮使用多個 Line Bot 部署實例。

### Q4: 我還沒設定會怎樣？
Bot 會檢查 `UPLOAD_FOLDER_ID` 是否存在，若未設定會回報錯誤訊息。

---

**更新日期**: 2025-10-08
**版本**: v2.2.0
