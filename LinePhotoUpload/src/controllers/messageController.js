import { userStateManager } from '../services/userStateService.js';
import { googleDriveService } from '../services/googleDriveService.js';
import { photoService } from '../services/photoService.js';
import { config } from '../../config/config.js';

// 處理 Line 訊息
export async function handleMessage(event, client) {
  const { type, replyToken, source } = event;
  const userId = source.userId;

  try {
    switch (type) {
      case 'message':
        await handleUserMessage(event, client, userId);
        break;
      case 'follow':
        await handleFollow(event, client, userId);
        break;
      default:
        console.log('未處理的事件類型:', type);
    }
  } catch (error) {
    console.error('處理訊息錯誤:', error);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '抱歉，發生了錯誤，請稍後再試。'
    });
  }
}

// 處理用戶訊息
async function handleUserMessage(event, client, userId) {
  const { message, replyToken } = event;

  switch (message.type) {
    case 'text':
      await handleTextMessage(message.text, replyToken, client, userId);
      break;
    case 'image':
      await handleImageMessage(message, replyToken, client, userId);
      break;
    default:
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '我只能處理文字訊息和照片喔！'
      });
  }
}

// 處理文字訊息
async function handleTextMessage(text, replyToken, client, userId) {
  // 主要指令處理
  if (text === 'hi' || text === 'Hi' || text === 'HI') {
    await showWelcomeMessage(replyToken, client, userId);
  }
  else if (text === '狀態' || text === 'status') {
    await handleStatus(replyToken, client, userId);
  }
  else if (text === '說明' || text === 'help') {
    await handleHelp(replyToken, client);
  }
  else {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '輸入 "hi" 開始使用，或直接傳送照片上傳。\n輸入「說明」查看使用方式。'
    });
  }
}

// 處理圖片訊息
async function handleImageMessage(message, replyToken, client, userId) {
  try {
    // 確保上傳資料夾存在
    await ensureUploadFolder(userId);

    const userState = userStateManager.getUserState(userId);

    // 顯示處理中訊息
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '📸 正在處理照片，請稍候...'
    });

    // 處理照片上傳
    const result = await photoService.processAndUpload(
      message.id,
      client,
      userState
    );

    // 推送結果訊息
    await client.pushMessage(userId, {
      type: 'text',
      text: `✅ ${result.fileName} 已上傳成功`
    });

  } catch (error) {
    console.error('處理圖片錯誤:', error);
    console.error('錯誤堆疊:', error.stack);

    let errorMessage = '❌ 照片上傳失敗，請稍後再試。';

    // 根據錯誤類型提供更具體的訊息
    if (error.message.includes('UPLOAD_FOLDER_ID')) {
      errorMessage = '❌ 上傳資料夾未設定，請聯繫管理員';
    } else if (error.message.includes('未提供上傳資料夾')) {
      errorMessage = '❌ 上傳資料夾 ID 無效，請聯繫管理員';
    } else if (error.message.includes('File not found') || error.message.includes('404')) {
      errorMessage = '❌ 找不到上傳資料夾，請檢查資料夾 ID 是否正確';
    } else if (error.message.includes('Permission') || error.message.includes('403')) {
      errorMessage = '❌ 無權限存取該資料夾，請檢查 Google Drive 權限';
    }

    await client.pushMessage(userId, {
      type: 'text',
      text: errorMessage
    });
  }
}

// 確保上傳資料夾存在
async function ensureUploadFolder(userId) {
  const userState = userStateManager.getUserState(userId);

  // 如果已經設定過資料夾，直接返回
  if (userState.currentFolderId) {
    return;
  }

  try {
    // 使用環境變數中設定的固定資料夾 ID
    const uploadFolderId = config.drive.uploadFolderId;

    if (!uploadFolderId) {
      throw new Error('UPLOAD_FOLDER_ID 環境變數未設定');
    }

    console.log(`使用固定上傳資料夾 ID: ${uploadFolderId}`);

    // 設定為當前上傳資料夾（資料夾名稱設為空字串，因為不再需要）
    userStateManager.setCurrentFolder(userId, 'Line相片上傳助手', uploadFolderId);

  } catch (error) {
    console.error('確保上傳資料夾存在時發生錯誤:', error);
    throw new Error('無法準備上傳資料夾');
  }
}

// 處理狀態查詢
async function handleStatus(replyToken, client, userId) {
  const userState = userStateManager.getUserState(userId);

  const statusText = `📊 當前狀態：
📁 本次已上傳：${userState.photoCount} 張照片
📸 模式：原始高畫質

💡 直接傳送照片即可自動上傳`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: statusText
  });
}

// 處理說明
async function handleHelp(replyToken, client) {
  const helpText = `🤖 Line 照片上傳助理

📝 可用指令：
• hi - 顯示歡迎訊息
• 狀態 - 查看當前設定
• 說明 - 顯示此說明

📸 使用方式：
1. 直接傳送照片即可自動上傳
2. 檔名格式：拍攝日期_編號.jpg（例：2025-10-07_001.jpg）
3. 每批上傳都會從 001 開始編號
4. 如有重複檔名會自動遞增編號

🔍 命名規則：
• 優先使用照片的 EXIF 拍攝日期
• 若無拍攝日期則使用檔案建立日期
• 自動檢查並避免檔名衝突`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: helpText
  });
}

// 處理關注事件
async function handleFollow(event, client, userId) {
  const welcomeText = `🎉 歡迎使用 Line 照片上傳助理！

我可以幫您：
• 將照片自動上傳到 Google Drive
• 自動以拍攝日期命名照片
• 智能避免檔名衝突

📸 直接傳送照片即可開始使用！

輸入 "說明" 查看詳細使用方式`;

  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: welcomeText
  });
}

// 顯示歡迎訊息
async function showWelcomeMessage(replyToken, client, userId) {
  const welcomeText = `👋 歡迎使用 Line 照片上傳助理！

📸 直接傳送照片即可自動上傳

📝 其他指令：
• 狀態 - 查看當前統計
• 說明 - 查看詳細使用方式

準備好了嗎？傳送照片開始吧！`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: welcomeText
  });
}
