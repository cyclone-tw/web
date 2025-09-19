import { google } from 'googleapis';
import { config } from '../../config/config.js';
import fs from 'fs-extra';

class GoogleDriveService {
  constructor() {
    try {
      // 檢查必要的環境變數
      if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
        console.warn('Google Drive API 環境變數未完整設定，某些功能可能無法使用');
        this.isEnabled = false;
        return;
      }

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
      this.isEnabled = true;
      console.log('Google Drive 服務初始化成功');
    } catch (error) {
      console.error('Google Drive 服務初始化失敗:', error);
      this.isEnabled = false;
    }
  }

  // 建立資料夾
  async createFolder(folderName, parentFolderId = config.drive.defaultFolderId) {
    try {
      if (!this.isEnabled) {
        throw new Error('Google Drive 服務未啟用');
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name'
      });

      console.log('資料夾建立成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('建立資料夾失敗:', error);
      throw error;
    }
  }

  // 上傳檔案
  async uploadFile(filePath, fileName, folderId = config.drive.defaultFolderId) {
    try {
      if (!this.isEnabled) {
        throw new Error('Google Drive 服務未啟用');
      }

      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      console.log('檔案上傳成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('檔案上傳失敗:', error);
      throw error;
    }
  }

  // 檢查資料夾是否存在
  async checkFolderExists(folderName, parentFolderId = config.drive.defaultFolderId) {
    try {
      if (!this.isEnabled) {
        return null;
      }

      const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await this.drive.files.list({
        q: parentFolderId ? `${query} and '${parentFolderId}' in parents` : query,
        fields: 'files(id, name)'
      });

      return response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      console.error('檢查資料夾失敗:', error);
      return null;
    }
  }

  // 列出資料夾內容
  async listFiles(folderId = config.drive.defaultFolderId) {
    try {
      if (!this.isEnabled) {
        throw new Error('Google Drive 服務未啟用');
      }

      const response = await this.drive.files.list({
        q: folderId ? `'${folderId}' in parents and trashed=false` : 'trashed=false',
        fields: 'files(id, name, mimeType, size, createdTime)'
      });

      return response.data.files;
    } catch (error) {
      console.error('列出檔案失敗:', error);
      throw error;
    }
  }

  // 專門列出資料夾
  async listFolders(parentFolderId = config.drive.defaultFolderId) {
    try {
      if (!this.isEnabled) {
        throw new Error('Google Drive 服務未啟用');
      }

      const query = `mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await this.drive.files.list({
        q: parentFolderId ? `${query} and '${parentFolderId}' in parents` : query,
        fields: 'files(id, name)',
        orderBy: 'name'
      });

      return response.data.files;
    } catch (error) {
      console.error('列出資料夾失敗:', error);
      throw error;
    }
  }
}

// 建立服務實例
export const googleDriveService = new GoogleDriveService();