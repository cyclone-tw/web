import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
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
      // 1. 下載照片
      tempFilePath = await this.downloadPhoto(messageId, lineClient, userState.mode);

      // 2. 生成檔案名稱
      const originalExtension = path.extname(tempFilePath).slice(1) || 'jpg';
      const fileName = userStateManager.generateFileName(userState.userId || 'unknown', originalExtension);

      // 3. 上傳到 Google Drive
      const result = await googleDriveService.uploadFile(
        tempFilePath,
        fileName,
        userState.currentFolderId
      );

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

  // 下載照片
  async downloadPhoto(messageId, lineClient, mode = 'compressed') {
    try {
      // 根據模式選擇 API 端點
      const apiEndpoint = mode === 'original'
        ? `https://api-data.line.me/v2/bot/message/${messageId}/content/original`
        : `https://api-data.line.me/v2/bot/message/${messageId}/content`;

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
          console.log(`照片已下載: ${tempFilePath} (模式: ${mode})`);
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