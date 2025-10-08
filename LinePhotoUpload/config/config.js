import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Line Bot 設定
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  },

  // Google Drive API 設定
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },

  // 應用程式設定
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // Google Drive 設定
  drive: {
    defaultFolderId: process.env.DEFAULT_FOLDER_ID,
    uploadFolderId: process.env.UPLOAD_FOLDER_ID, // 固定的上傳資料夾 ID
  },
};