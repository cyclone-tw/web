# 更新日誌 (Changelog)

## v6.0 (2025-10-14) 🎯 完美修復版

### 🐛 重大 Bug 修復

#### 🖼️ 圖片上傳立即顯示問題
- ✅ **徹底修復圖片上傳後無法立即顯示的問題**
  - 調整 DOM 更新順序：先顯示容器，再設置畫布
  - 使用 `requestAnimationFrame` 確保渲染完成
  - 移除不必要的強制重繪邏輯
  - 圖片上傳後**立即可見**，不需要縮放頁面
  - 解決了 v5.2 和 v5.3 的殘留問題

#### ✏️ 繪圖筆跡保持問題
- ✅ **完全修復頁面縮放時繪圖筆跡消失的問題**
  - 實作繪圖內容保存機制（`savedDrawing`）
  - 使用 `getImageData` 和 `putImageData` 保存/恢復繪圖
  - 縮放操作不再清空繪圖內容
  - 視窗大小改變時自動恢復繪圖
  - 繪圖筆跡永久保持，直到手動清除

#### 📐 版面配置優化
- ✅ **改善雙欄式布局，優化使用體驗**
  - 左側控制面板寬度調整為 350px
  - 使用 CSS Grid 固定布局（`grid-template-columns: 350px 1fr`）
  - 右側預覽區域固定顯示，不會因窗口變窄而跑到下方
  - 控制面板和預覽區並排顯示，調整時即時看到效果
  - 小螢幕（< 1200px）自動切換為垂直布局
  - 移除控制面板的 `sticky` 定位，改善滾動體驗

#### 🖱️ 拖曳精度改善
- ✅ **確保拖曳功能在所有縮放級別下正常運作**
  - 拖曳計算考慮 `currentZoom` 縮放比例
  - 縮放元素時也考慮縮放比例（`handleResizeMove`）
  - 拖曳偏移計算更精準
  - 不會出現元素跳動或位移現象

### 🔧 技術改進

#### 繪圖保存系統
```javascript
// 新增繪圖保存變數
let savedDrawing = null;

// 保存繪圖內容
function saveDrawing() {
    savedDrawing = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
}

// 恢復繪圖內容
function restoreDrawing() {
    if (savedDrawing) {
        drawCtx.putImageData(savedDrawing, 0, 0);
    }
}

// 在關鍵時機保存/恢復
drawCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
    saveDrawing(); // 繪製完成後保存
});

window.addEventListener('resize', () => {
    if (currentImage) {
        saveDrawing();
        setupCanvas(currentImage);
        // setupCanvas 內部會呼叫 restoreDrawing()
    }
});
```

#### 圖片上傳優化
```javascript
// 修正後的上傳流程
img.onload = function() {
    currentImage = img;
    currentRotation = 0;

    // 先顯示容器
    document.getElementById('upload-prompt').style.display = 'none';
    document.getElementById('canvas-wrapper').style.display = 'flex';

    // 確保 DOM 更新後再設置畫布
    requestAnimationFrame(() => {
        setupCanvas(img);
        // 顯示所有控制區域
        document.getElementById('toolbar').classList.add('active');
        // ...
    });
};
```

#### 版面配置改進
```css
.main-content {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 0;
    height: calc(100vh - 200px);
    min-height: 600px;
}

.control-panel {
    background: #16213e;
    padding: 20px;
    border-right: 1px solid #0f4c75;
    overflow-y: auto;
    max-height: calc(100vh - 200px);
}

/* 響應式：小螢幕自動切換為垂直布局 */
@media (max-width: 1200px) {
    .main-content {
        grid-template-columns: 1fr;
        height: auto;
    }
}
```

#### 縮放功能改善
```javascript
function applyZoom() {
    const container = document.getElementById('canvas-container');
    const scale = currentZoom / 100;
    container.style.transform = `scale(${scale})`;
    document.getElementById('zoomInfo').textContent = currentZoom + '%';

    // 繪圖內容會自動隨容器縮放，無需重繪
}
```

### 🎨 介面優化
- 版本標籤更新為 v6.0
- 副標題改為「完美修復版 | 圖片立即顯示 · 繪圖保持 · 最佳布局」
- 控制面板寬度優化，更緊湊
- 貼圖網格尺寸調小，減少滾動需求
- 移除不必要的 `transition` 效果，提升效能

### 📦 完整功能列表
1. ✅ 圖片上傳（點擊 + 拖曳）✨ **完美修復**
2. ✅ 圖片立即顯示 ✨ **v6.0 新增**
3. ✅ 圖片自適應顯示
4. ✅ 圖片縮放（10%-200%）
5. ✅ 圖片旋轉（左/右 90°）
6. ✅ 可調濾鏡（6 種參數，可疊加）
7. ✅ 文字框新增（無限）
8. ✅ 文字框拖曳 ✨ **精度改善**
9. ✅ 文字框縮放
10. ✅ 文字框旋轉（上方控制器）
11. ✅ 文字樣式（字體、大小、顏色、粗體、描邊）
12. ✅ 貼圖庫（48 個）
13. ✅ 貼圖拖曳、縮放、旋轉
14. ✅ PNG 覆蓋圖層（多重上傳）
15. ✅ 繪圖工具（筆跡永久保持）✨ **v6.0 完全修復**
16. ✅ 高品質匯出
17. ✅ 暗色科技風格介面
18. ✅ Favicon 圖示
19. ✅ AI 協作資訊顯示
20. ✅ 最佳雙欄布局 ✨ **v6.0 優化**

### 🎯 主要改善
- **圖片上傳**：100% 可靠，上傳後立即顯示
- **繪圖功能**：筆跡完全保持，不受縮放影響
- **版面配置**：固定雙欄布局，調整時即時預覽
- **拖曳功能**：所有縮放級別下都精準無誤
- **使用體驗**：不需要滾輪縮放頁面來顯示圖片

### ✨ v6.0 解決的用戶痛點
1. ❌ **舊問題**：圖片上傳後看不到，需要縮放頁面才出現
   ✅ **v6.0**：圖片上傳後立即顯示，無需任何額外操作

2. ❌ **舊問題**：繪圖後縮放頁面，筆跡就消失了
   ✅ **v6.0**：繪圖內容永久保持，縮放不影響

3. ❌ **舊問題**：瀏覽器窗口變窄時，預覽圖跑到下面，看不到調整效果
   ✅ **v6.0**：固定雙欄布局，控制面板和預覽區始終並排

4. ❌ **舊問題**：調整文字大小時需要一直滾輪往下找預覽區
   ✅ **v6.0**：預覽區固定在右側，調整時即時看到效果

---

## v5.3 (2025-10-13) 🔧 修復優化版

### 🐛 重大 Bug 修復

#### 🖼️ 圖片上傳顯示問題
- ✅ **修復圖片上傳後畫布消失的問題**
  - 移除有問題的強制重繪邏輯
  - 簡化 setupCanvas 流程
  - 確保圖片上傳後立即正常顯示
  - 不再出現畫面閃爍或畫布消失的狀況

#### 🎯 文字框拖曳精度
- ✅ **修復文字框拖曳位移問題**
  - 重新計算拖曳時的縮放比例
  - 考慮 `currentZoom` 對滑鼠位置的影響
  - 拖曳時不再有跳動或位移現象
  - 更精準的拖曳體驗

### 🎨 介面優化

#### 📋 控制面板順序調整
- ✅ **調整區塊顯示順序**
  - 新順序：
    1. 📁 圖片上傳
    2. 🖼️ PNG 覆蓋圖層
    3. 📝 文字框管理
    4. 🎨 文字樣式
    5. 🎨 圖片調整
    6. 😀 貼圖庫
    7. 💾 匯出梗圖
  - 更符合使用流程的邏輯順序
  - 常用功能優先顯示

### 🔧 技術改進

#### 拖曳系統優化
```javascript
// 修正前：未考慮縮放
const offsetX = e.clientX - rect.left;

// 修正後：考慮縮放比例
const scale = currentZoom / 100;
const offsetX = (e.clientX - rect.left) / scale;
```

#### 畫布設置簡化
```javascript
// 移除強制重繪邏輯
// 保持簡潔的設置流程
canvas.width = img.width;
canvas.height = img.height;
drawRotatedImage();
resetZoom();
```

### 📦 完整功能列表
1. ✅ 圖片上傳（點擊 + 拖曳）✨ 已修復
2. ✅ 圖片自適應顯示
3. ✅ 圖片縮放（10%-200%）
4. ✅ 圖片旋轉（左/右 90°）
5. ✅ 可調式濾鏡（6 種參數，可疊加）
6. ✅ 文字框新增（無限）
7. ✅ 文字框拖曳 ✨ 已修復
8. ✅ 文字框縮放
9. ✅ 文字框旋轉（上方控制器）
10. ✅ 文字樣式（字體、大小、顏色、粗體、描邊）
11. ✅ 貼圖庫（48 個）
12. ✅ 貼圖拖曳、縮放、旋轉
13. ✅ PNG 覆蓋圖層（多重上傳）
14. ✅ 繪圖工具（筆跡持續保留）
15. ✅ 高品質匯出
16. ✅ 暗色科技風格介面
17. ✅ Favicon 圖示
18. ✅ AI 協作資訊顯示

---

## v5.2 (2025-10-13) 🎨 完善版

### ✨ 新增功能

#### 🎨 Favicon 圖示
- ✅ **新增調色盤 emoji favicon**
  - 使用 SVG 格式的 🎨 圖示
  - 顯眼且符合梗圖產生器主題
  - 支援所有現代瀏覽器

#### 🤖 AI 協作資訊
- ✅ **版本標籤新增協作資訊**
  - 顯示格式：`v5.2 | 🤖 AI協作夥伴：Claude Code | Cyclone`
  - 清楚標示專案協作者
  - 機器人 emoji 增加辨識度

### 🐛 Bug 修復

#### 🖼️ 底圖立即顯示問題
- ✅ **修復底圖上傳後不立即顯示的問題**
  - 新增 `requestAnimationFrame` 強制重繪
  - 加入淡入動畫效果（opacity 0→1）
  - 確保圖片上傳後立即可見
  - 不需再縮放視窗才能看到底圖

### 🔧 技術改進

#### 強制重繪機制
```javascript
// 強制重繪，確保圖片立即顯示
requestAnimationFrame(() => {
    canvas.style.display = 'block';
    drawCanvas.style.display = 'block';
    container.style.opacity = '0';
    setTimeout(() => {
        container.style.opacity = '1';
        container.style.transition = 'opacity 0.3s ease';
    }, 10);
});
```

### 📦 完整功能列表
1. ✅ 圖片上傳（點擊 + 拖曳）✨ 改進
2. ✅ 圖片自適應顯示
3. ✅ 圖片縮放（10%-200%）
4. ✅ 圖片旋轉（左/右 90°）
5. ✅ 可調式濾鏡（6 種參數，可疊加）
6. ✅ 文字框新增（無限）
7. ✅ 文字框拖曳
8. ✅ 文字框縮放
9. ✅ 文字框旋轉（上方控制器）
10. ✅ 文字樣式（字體、大小、顏色、粗體、描邊）
11. ✅ 貼圖庫（48 個）
12. ✅ 貼圖拖曳、縮放、旋轉
13. ✅ PNG 覆蓋圖層（多重上傳）
14. ✅ 繪圖工具（筆跡持續保留）
15. ✅ 高品質匯出
16. ✅ 暗色科技風格介面
17. ✅ Favicon 圖示 ⭐ NEW
18. ✅ AI 協作資訊顯示 ⭐ NEW

---

## v5.1 (2025-10-13) 🔥 終極強化版

### ✨ 重大改進

#### 🎨 可調式濾鏡系統
- ✅ **完全重新設計的濾鏡控制**
  - 移除固定效果的濾鏡按鈕
  - 改為**獨立滑桿**精細控制
  - 所有濾鏡可以**同時疊加使用**
  - 即時預覽調整效果

- ✅ **6 種可調濾鏡參數**
  - **亮度** (Brightness): 50% - 200%
  - **對比度** (Contrast): 50% - 200%
  - **飽和度** (Saturation): 0% - 200%
  - **黑白** (Grayscale): 0% - 100%
  - **懷舊** (Sepia): 0% - 100%
  - **模糊** (Blur): 0px - 10px

- ✅ **濾鏡組合**
  - 可自由組合多種效果
  - 例如：50% 黑白 + 120% 對比度 + 80% 亮度
  - 一鍵重置所有調整

#### ✏️ 繪圖圖層持續顯示
- ✅ **修復繪圖消失問題**
  - 關閉繪圖模式時，筆跡**不會消失**
  - 繪圖圖層永久保留，直到手動清除
  - 只是切換為不可繪製狀態
  - 完美解決操作衝突問題

### 🔧 技術實現

#### 繪圖圖層修正
```css
/* 繪圖畫布總是可見 */
#draw-canvas {
    display: block;  /* 不再用 none */
    pointer-events: none;  /* 預設不響應點擊 */
}

#draw-canvas.active {
    pointer-events: all;  /* 繪圖模式才響應 */
    cursor: crosshair;
}
```

#### 濾鏡系統重構
```javascript
// 濾鏡設定物件
let filterSettings = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    blur: 0
};

// 組合所有濾鏡
function applyFilters() {
    const filterString = `
        brightness(${filterSettings.brightness}%)
        contrast(${filterSettings.contrast}%)
        saturate(${filterSettings.saturation}%)
        grayscale(${filterSettings.grayscale}%)
        sepia(${filterSettings.sepia}%)
        blur(${filterSettings.blur}px)
    `.trim();
    container.style.filter = filterString;
}
```

### 🎨 介面優化
- 新增「圖片調整」專屬區塊
- 每個濾鏡都有清晰的滑桿和數值顯示
- 控制面板寬度增加至 380px（容納更多控制項）
- 版本標籤改為紅色突顯 v5.1

### 📦 完整功能列表
1. ✅ 圖片上傳（點擊 + 拖曳）
2. ✅ 圖片自適應顯示
3. ✅ 圖片縮放（10%-200%）
4. ✅ 圖片旋轉（左/右 90°）
5. ✅ **可調式濾鏡**（6 種參數，可疊加）⭐ v5.1
6. ✅ 文字框新增（無限）
7. ✅ 文字框拖曳（已修復）
8. ✅ 文字框縮放
9. ✅ 文字框旋轉（上方控制器）
10. ✅ 文字樣式（字體、大小、顏色、粗體、描邊）
11. ✅ 貼圖庫（48 個）
12. ✅ 貼圖拖曳、縮放、旋轉
13. ✅ PNG 覆蓋圖層（多重上傳）
14. ✅ **繪圖工具**（筆跡持續保留）⭐ v5.1 改進
15. ✅ 高品質匯出
16. ✅ 暗色科技風格介面

### 🎯 使用場景

#### 濾鏡調整範例
- **復古風格**：懷舊 60% + 對比度 120% + 亮度 90%
- **高對比黑白**：黑白 100% + 對比度 150% + 亮度 110%
- **柔焦效果**：模糊 3px + 亮度 110% + 飽和度 120%
- **低飽和冷色調**：飽和度 60% + 亮度 95% + 對比度 105%

#### 繪圖工具改進
- 繪製完成後可關閉繪圖模式
- 筆跡保留在畫面上，不會消失
- 繼續調整其他元素，筆跡依然存在
- 需要清除才按「清除」按鈕

---

## v5.0 (2025-10-13) 🚀 終極版 - Phase 3

### ✨ 全新功能

#### 🎯 旋轉控制器改進
- ✅ **旋轉控制點移至元素上方**
  - 從右上角改為元素正上方（中央位置）
  - 大型圓形按鈕（30px），內含旋轉符號 ↻
  - 更直觀的旋轉操作體驗
  - 所有元素（文字框、貼圖、PNG）都支援

#### 🖼️ PNG 覆蓋圖層系統
- ✅ **多重 PNG 圖片覆蓋**
  - 可上傳多個透明 PNG 圖片
  - 作為獨立圖層疊加在底圖上
  - 支援拖曳、縮放、旋轉
  - 自動調整初始尺寸（最大 200px）
  - 橘色邊框區分（不同於文字框的藍色）
  - 顯著增加梗圖豐富度和創意空間

#### ✏️ 繪圖工具
- ✅ **自由繪畫功能**
  - 工具列新增繪圖模式切換
  - 獨立繪圖圖層（不影響其他元素）
  - 可調顏色選擇器
  - 筆刷大小調整（1-20px）
  - 清除繪圖按鈕
  - 繪圖模式下自動取消元素選取
  - 適合畫箭頭、圈選重點、手繪標註

### 🔧 技術改進

#### 旋轉控制器重新設計
```css
.rotate-handle {
    width: 30px;
    height: 30px;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    /* 大型圓形按鈕，置於元素上方中央 */
}

.rotate-handle::after {
    content: '↻';  /* 旋轉符號 */
}
```

#### PNG 覆蓋圖層管理
```javascript
// 新的元素類型
.overlay-element {
    border-color: #ffa502;  // 橘色邊框
    z-index: 10;
}

// 自動調整尺寸
const maxSize = 200;
const ratio = Math.min(maxSize / width, maxSize / height, 1);
width *= ratio;
height *= ratio;
```

#### 繪圖系統
```javascript
// 獨立 canvas 圖層
<canvas id="draw-canvas"></canvas>

// 繪圖狀態管理
let drawMode = false;
let isDrawing = false;

// 繪圖事件處理
drawCanvas.addEventListener('mousedown', startDrawing);
drawCanvas.addEventListener('mousemove', draw);
drawCanvas.addEventListener('mouseup', stopDrawing);
```

#### 匯出改進
```javascript
// 包含繪圖層
exportCtx.drawImage(drawCanvas, 0, 0);

// 支援 PNG 覆蓋圖層
if (elementData.type === 'overlay') {
    exportCtx.drawImage(elementData.img, -width / 2, -height / 2, width, height);
}
```

### 🎨 介面優化
- 工具列新增「繪圖」區塊
  - 繪圖模式切換按鈕
  - 顏色選擇器
  - 筆刷大小滑桿
  - 清除繪圖按鈕
- 控制面板新增「PNG 覆蓋圖層」區塊
- 版本標籤更新為 v5.0
- 標題改為「梗圖產生器 ULTIMATE」

### 📦 完整功能列表
1. ✅ 圖片上傳（點擊 + 拖曳）
2. ✅ 圖片自適應顯示
3. ✅ 圖片縮放（10%-200%）
4. ✅ 圖片旋轉（左/右 90°）
5. ✅ 濾鏡特效（8 種）
6. ✅ 文字框新增（無限）
7. ✅ 文字框拖曳（已修復）
8. ✅ 文字框縮放
9. ✅ 文字框旋轉（上方控制器）⭐ NEW
10. ✅ 文字樣式（字體、大小、顏色、粗體、描邊）
11. ✅ 貼圖庫（48 個）
12. ✅ 貼圖拖曳、縮放、旋轉
13. ✅ PNG 覆蓋圖層（多重上傳）⭐ NEW
14. ✅ 繪圖工具（自由繪畫）⭐ NEW
15. ✅ 高品質匯出
16. ✅ 暗色科技風格介面

### 🎯 使用場景

#### PNG 覆蓋圖層範例
- 在人物照片上加入對話框 PNG
- 疊加表情符號或貼紙 PNG
- 添加裝飾性邊框或圖案
- 製作多層次複雜梗圖

#### 繪圖工具範例
- 畫箭頭指向重點
- 圈選或標註特定區域
- 手繪表情或圖案
- 添加連接線或註解

---

## v4.0 (2025-10-13) 🎉 完整版 - Phase 2

### ✨ 全新功能

#### 🐛 關鍵 Bug 修復
- ✅ **修復文字框拖曳位移問題**
  - 重構拖曳邏輯，記錄滑鼠相對於元素的偏移
  - 使用 `offsetX` 和 `offsetY` 計算正確位置
  - 現在拖曳時不會有左上方跳動的問題
  - 拖曳感受自然流暢

#### 😀 貼圖/表情庫
- ✅ **48 個內建表情貼圖**
  - 表情類：😀 😂 🤣 😭 😍 😱 等
  - 手勢類：👍 👎 👌 ✌️ 💪 等
  - 符號類：❤️ 💯 🔥 ⭐ ✨ 等
  - 箭頭類：➡️ ⬅️ ⬆️ ⬇️ 等
- ✅ 點擊即可加入到梗圖
- ✅ 貼圖可拖曳、縮放、旋轉
- ✅ 支援多個貼圖同時使用

#### 🔄 圖片旋轉功能
- ✅ **圖片旋轉控制**
  - 左轉 90° 按鈕
  - 右轉 90° 按鈕
  - 自動重繪旋轉後的圖片
  - 保持圖片品質

#### 🎭 濾鏡特效
- ✅ **8 種濾鏡效果**
  - 無濾鏡（原圖）
  - 黑白（grayscale）
  - 懷舊（sepia）
  - 反轉（invert）
  - 高對比（contrast）
  - 亮度增強（brightness）
  - 模糊（blur）
  - 飽和度（saturate）
- ✅ 即時預覽濾鏡效果
- ✅ 一鍵切換濾鏡

#### 🔁 文字框/貼圖旋轉
- ✅ **右上角旋轉控制點**
  - 綠色圓點為旋轉控制
  - 拖曳旋轉，任意角度
  - 即時顯示旋轉角度
  - 文字和貼圖都支援旋轉

### 🔧 技術改進

#### 拖曳系統重構
```javascript
// 修正前：直接使用滑鼠位置
newX = e.clientX - containerRect.left - dragStartX;

// 修正後：記錄相對偏移
dragState = {
    offsetX: e.clientX - rect.left,  // 滑鼠相對元素的位置
    offsetY: e.clientY - rect.top
};
newX = e.clientX - containerRect.left - dragState.offsetX;
```

#### 統一元素管理
- 文字框和貼圖使用相同的元素系統
- 統一的選取、拖曳、縮放、旋轉邏輯
- `elements` 陣列管理所有元素

#### 旋轉系統
```javascript
// 使用 transform: rotate()
element.style.transform = `rotate(${rotation}deg)`;
// 儲存旋轉角度
element.dataset.rotation = rotation;
```

#### 濾鏡系統
```javascript
// 使用 CSS filter
container.style.filter = filterCss;
// 匯出時套用到 canvas
exportCtx.filter = filterCss;
```

### 🎨 介面升級
- 新增工具列（縮放 + 旋轉控制）
- 貼圖選擇網格介面
- 濾鏡選擇網格介面
- 版本標籤更新為 v4.0
- 標題改為「梗圖產生器 PRO」

### 📦 完整功能列表
1. ✅ 圖片上傳（點擊 + 拖曳）
2. ✅ 圖片自適應顯示
3. ✅ 圖片縮放（10%-200%）
4. ✅ 圖片旋轉（左/右 90°）
5. ✅ 濾鏡特效（8 種）
6. ✅ 文字框新增（無限）
7. ✅ 文字框拖曳（已修復）
8. ✅ 文字框縮放
9. ✅ 文字框旋轉
10. ✅ 文字樣式（字體、大小、顏色、粗體、描邊）
11. ✅ 貼圖庫（48 個）
12. ✅ 貼圖拖曳、縮放、旋轉
13. ✅ 高品質匯出
14. ✅ 暗色科技風格介面

---

## v3.0 (2025-10-13) ⭐ 重大更新

### 🎯 核心改進
- ✅ **圖片自適應顯示**
  - 圖片自動適應右側容器大小
  - 瀏覽器視窗調整時，圖片自動重新計算尺寸
  - 不會爆出容器範圍
  - 保持圖片原始比例

- ✅ **圖片縮放功能**
  - 新增縮放控制器（10% - 200%）
  - 滑桿即時縮放
  - ➕ / ➖ 按鈕快速調整
  - 重置按鈕一鍵還原
  - 使用者可自由放大圖片（即使會模糊）

- ✅ **完全重構拖曳系統**
  - 全新的拖曳狀態管理
  - 使用 dragState 物件追蹤狀態
  - 完全分離拖曳和縮放邏輯
  - 防止事件干擾
  - 拖曳更流暢、更精準

### 🐛 重大 Bug 修復
- 修復文字框無法自由拖曳的問題
- 修復圖片爆框問題
- 修復視窗縮放時圖片不適應的問題
- 改善滑鼠事件處理邏輯

### 🎨 介面優化
- 新增縮放控制器介面
- 版本標籤更新為 v3.0
- 縮放資訊即時顯示
- 容器高度自動調整

### 💻 技術改進
- 完全重構事件處理系統
- 使用全域狀態物件管理拖曳/縮放
- 改善 canvas 和容器的尺寸計算邏輯
- 匯出時自動計算正確的縮放比例

---

## v2.0 (2025-10-13)

### 🎨 視覺改進
- ✅ **全新暗色科技風格**
  - 深藍色漸層背景（#0f2027 → #203a43 → #2c5364）
  - 青藍色主題色（#00d4ff）
  - 發光動畫效果
  - 暗色控制面板和表單
  - 科技感滾動條

### 🚀 功能改進
- ✅ **拖曳上傳功能**
  - 支援拖曳圖片到上傳區域
  - 拖曳視覺回饋（邊框高亮）
  - 防止誤觸發瀏覽器預設行為

- ✅ **修復圖片縮放問題**
  - 圖片使用原始尺寸顯示
  - 不再強制限制 800x600
  - 視窗調整時圖片保持原尺寸
  - 支援左右滾動查看大圖

- ✅ **修復文字框拖曳問題**
  - 重構拖曳事件邏輯
  - 防止 textarea 干擾拖曳
  - 改善拖曳手感和靈敏度
  - 添加 e.preventDefault() 和 e.stopPropagation()
  - 拖曳時游標正確顯示為 move

### 🐛 Bug 修復
- 修復文字框無法正常拖曳的問題
- 修復圖片不隨視窗縮放的問題
- 修復左右滾動條不顯示的問題
- 改善縮放控制點的交互邏輯

### 📝 介面優化
- 版本標籤顯示（v2.0）
- 更清晰的拖曳提示文字
- 暗色主題的表單和輸入框
- 發光效果的標題動畫

---

## v1.0 (2025-10-13)

### ✨ 初始功能
- 圖片上傳（點擊選擇）
- 無限新增文字框
- 文字框拖曳移動
- 文字框縮放（文字大小聯動）
- 文字樣式設定：
  - 6 種字體選擇
  - 顏色自訂
  - 粗體選項
  - 描邊效果
- 高品質 PNG 匯出
- 清空重來功能

### 🎨 視覺設計
- 紫色漸層背景
- 白色控制面板
- 響應式佈局

---

## 📌 版本對照

| 功能 | v1.0 | v2.0 |
|------|------|------|
| 圖片上傳方式 | 點擊選擇 | 點擊 + 拖曳 |
| 圖片顯示 | 限制尺寸 | 原始尺寸 |
| 文字框拖曳 | ❌ 有問題 | ✅ 已修復 |
| 視窗縮放 | ❌ 圖片不跟著縮放 | ✅ 支援滾動查看 |
| 左右滾動 | ❌ 不支援 | ✅ 支援 |
| 背景風格 | 紫色 | 暗色科技 |
| 版本標籤 | 無 | v2.0 |

---

## 🚀 下一版本計畫 (v3.0)

### 待加入功能
- [ ] 文字框旋轉功能
- [ ] 圖層管理面板
- [ ] 復原/重做功能
- [ ] 貼圖庫
- [ ] 經典梗圖範本
- [ ] 濾鏡特效
- [ ] 草稿儲存
- [ ] 塗鴉工具

---

**維護者**: Meme Generator Team
**最後更新**: 2025-10-13
