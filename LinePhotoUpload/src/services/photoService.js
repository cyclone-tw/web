import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import exifParser from 'exif-parser';
import { googleDriveService } from './googleDriveService.js';
import { userStateManager } from './userStateService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PhotoService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDir();
  }

  // 確保臨時目錄存在
  async ensureTempDir() {
    await fs.ensureDir(this.tempDir);
  }

  // 處理並上傳照片
  async processAndUpload(messageId, lineClient, userState) {
    let tempFilePath = null;

    try {
      // 1. 下載照片（固定使用原始模式）
      tempFilePath = await this.downloadPhoto(messageId, lineClient, 'original');

      // 2. 讀取照片日期
      const photoDate = await this.extractPhotoDate(tempFilePath);

      // 3. 生成檔案名稱（基於照片日期，從 001 開始）
      const originalExtension = path.extname(tempFilePath).slice(1) || 'jpg';
      const fileName = await this.generateUniqueFileName(
        photoDate,
        originalExtension,
        userState.currentFolderId
      );

      // 4. 上傳到 Google Drive
      const result = await googleDriveService.uploadFile(
        tempFilePath,
        fileName,
        userState.currentFolderId
      );

      // 5. 增加照片計數
      userStateManager.incrementPhotoCount(userState.userId);

      return {
        ...result,
        fileName: fileName,
      };
    } catch (error) {
      console.error('處理照片錯誤:', error);
      throw error;
    } finally {
      // 清理臨時檔案
      if (tempFilePath && await fs.pathExists(tempFilePath)) {
        await fs.remove(tempFilePath);
      }
    }
  }

  // 讀取照片的拍攝日期或建立日期
  async extractPhotoDate(filePath) {
    try {
      // 先嘗試讀取 EXIF 資料
      const buffer = await fs.readFile(filePath);

      try {
        const parser = exifParser.create(buffer);
        const result = parser.parse();

        // 檢查是否有拍攝日期
        if (result.tags && result.tags.DateTimeOriginal) {
          const exifDate = new Date(result.tags.DateTimeOriginal * 1000);
          console.log('使用 EXIF 拍攝日期:', exifDate);
          return exifDate;
        }
      } catch (exifError) {
        console.log('無法讀取 EXIF 資料，使用檔案建立日期');
      }

      // 如果沒有 EXIF 資料，使用檔案建立時間
      const stats = await fs.stat(filePath);
      console.log('使用檔案建立日期:', stats.birthtime);
      return stats.birthtime;

    } catch (error) {
      console.error('讀取照片日期失敗:', error);
      // 如果所有方法都失敗，使用當前日期
      return new Date();
    }
  }

  // 生成唯一的檔案名稱（避免衝突）
  async generateUniqueFileName(photoDate, extension, folderId) {
    // 格式化日期為 YYYY-MM-DD
    const dateStr = this.formatDate(photoDate);

    // 從 001 開始嘗試
    let counter = 1;
    let fileName = `${dateStr}_${counter.toString().padStart(3, '0')}.${extension}`;

    // 檢查檔名是否已存在，如果存在則遞增編號
    while (await googleDriveService.checkFileExists(fileName, folderId)) {
      counter++;
      fileName = `${dateStr}_${counter.toString().padStart(3, '0')}.${extension}`;

      // 安全檢查：避免無限迴圈
      if (counter > 9999) {
        throw new Error('檔案編號超過上限（9999），請檢查資料夾');
      }
    }

    console.log(`生成檔名: ${fileName}（編號: ${counter}）`);
    return fileName;
  }

  // 格式化日期為 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 下載照片
  async downloadPhoto(messageId, lineClient, mode = 'original') {
    try {
      // Line API 只有 /content 端點，會自動返回原始大小的圖片
      const apiEndpoint = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

      // 取得 Line 的存取權杖
      const accessToken = lineClient.config.channelAccessToken;

      // 下載照片
      const response = await axios.get(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        responseType: 'stream',
      });

      // 生成臨時檔案路徑
      const timestamp = Date.now();
      const extension = this.getFileExtension(response.headers['content-type']) || 'jpg';
      const tempFilePath = path.join(this.tempDir, `${timestamp}_${messageId}.${extension}`);

      // 儲存檔案
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`照片已下載: ${tempFilePath}`);
          resolve(tempFilePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('下載照片錯誤:', error);
      throw new Error(`無法下載照片：${error.message}`);
    }
  }

  // 取得檔案副檔名
  getFileExtension(contentType) {
    const mimeTypes = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };

    return mimeTypes[contentType] || 'jpg';
  }

  // 取得檔案大小（MB）
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return (stats.size / (1024 * 1024)).toFixed(2); // MB
    } catch (error) {
      console.error('取得檔案大小錯誤:', error);
      return 'Unknown';
    }
  }

  // 清理舊的臨時檔案
  async cleanupTempFiles(maxAgeHours = 1) {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // 轉換為毫秒

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          console.log(`已清理舊檔案: ${file}`);
        }
      }
    } catch (error) {
      console.error('清理臨時檔案錯誤:', error);
    }
  }
}

// 建立單例實例
export const photoService = new PhotoService();

// 定期清理臨時檔案（每小時執行一次）
setInterval(() => {
  photoService.cleanupTempFiles();
}, 60 * 60 * 1000);
