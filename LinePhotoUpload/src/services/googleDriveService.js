import { google } from 'googleapis';
import { config } from '../../config/config.js';
import fs from 'fs-extra';

class GoogleDriveService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    // 設定重新整理權杖
    this.oauth2Client.setCredentials({
      refresh_token: config.google.refreshToken
    });

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  // 建立資料夾
  async createFolder(folderName, parentFolderId = config.drive.defaultFolderId) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      console.log(`資料夾已建立，ID: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('建立資料夾錯誤:', error);
      throw new Error(`無法建立資料夾：${error.message}`);
    }
  }

  // 上傳檔案
  async uploadFile(filePath, fileName, folderId) {
    try {
      const fileMetadata = {
        name: fileName,
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,size',
      });

      console.log(`檔案已上傳: ${fileName}, ID: ${response.data.id}`);
      return {
        fileId: response.data.id,
        fileName: response.data.name,
        size: response.data.size,
      };
    } catch (error) {
      console.error('上傳檔案錯誤:', error);
      throw new Error(`無法上傳檔案：${error.message}`);
    }
  }

  // 檢查資料夾是否存在
  async checkFolderExists(folderName, parentFolderId = config.drive.defaultFolderId) {
    try {
      let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;

      if (parentFolderId) {
        query += ` and '${parentFolderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
      });

      return response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      console.error('檢查資料夾錯誤:', error);
      throw new Error(`無法檢查資料夾：${error.message}`);
    }
  }

  // 列出資料夾內容
  async listFiles(folderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, modifiedTime)',
        orderBy: 'modifiedTime desc',
      });

      return response.data.files;
    } catch (error) {
      console.error('列出檔案錯誤:', error);
      throw new Error(`無法列出檔案：${error.message}`);
    }
  }

  // 取得檔案資訊
  async getFileInfo(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, mimeType, modifiedTime, parents',
      });

      return response.data;
    } catch (error) {
      console.error('取得檔案資訊錯誤:', error);
      throw new Error(`無法取得檔案資訊：${error.message}`);
    }
  }
}

// 建立單例實例
export const googleDriveService = new GoogleDriveService();