import { userStateManager } from '../services/userStateService.js';
import { googleDriveService } from '../services/googleDriveService.js';
import { photoService } from '../services/photoService.js';

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
  const userState = userStateManager.getUserState(userId);

  // 導航狀態處理
  if (userState.navigationState !== 'main') {
    await handleNavigationInput(text, replyToken, client, userId, userState);
    return;
  }

  // 主選單指令處理
  if (text === 'hi' || text === 'Hi' || text === 'HI') {
    await showMainMenu(replyToken, client, userId);
  }
  else if (text === '1') {
    await handleSelectExistingFolder(replyToken, client, userId);
  }
  else if (text === '2') {
    await handleStartCreateFolder(replyToken, client, userId);
  }
  else if (text === '3') {
    await handleStatus(replyToken, client, userId);
  }
  else if (text === '4') {
    await handleHelp(replyToken, client);
  }
  // 舊的指令處理（向後相容）
  else if (text.startsWith('建立資料夾：')) {
    const folderName = text.replace('建立資料夾：', '').trim();
    await handleCreateFolder(folderName, replyToken, client, userId);
  }
  else if (text.startsWith('設定命名：')) {
    const namePrefix = text.replace('設定命名：', '').trim();
    await handleSetNaming(namePrefix, replyToken, client, userId);
  }
  else if (text === '原始模式') {
    await handleSetMode('original', replyToken, client, userId);
  }
  else if (text === '一般模式') {
    await handleSetMode('compressed', replyToken, client, userId);
  }
  else if (text === '狀態') {
    await handleStatus(replyToken, client, userId);
  }
  else if (text === '說明' || text === 'help') {
    await handleHelp(replyToken, client);
  }
  else {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '輸入 "hi" 開始使用，或輸入「說明」查看指令。'
    });
  }
}

// 處理圖片訊息
async function handleImageMessage(message, replyToken, client, userId) {
  try {
    const userState = userStateManager.getUserState(userId);

    if (!userState.currentFolder) {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '請先設定資料夾：建立資料夾：[資料夾名稱]'
      });
      return;
    }

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
      text: `✅ ${result.fileName} 已上傳到「${userState.currentFolder}」資料夾\n模式：${userState.mode === 'original' ? '原始' : '一般'}`
    });

  } catch (error) {
    console.error('處理圖片錯誤:', error);
    await client.pushMessage(userId, {
      type: 'text',
      text: '❌ 照片上傳失敗，請稍後再試。'
    });
  }
}

// 處理建立資料夾
async function handleCreateFolder(folderName, replyToken, client, userId) {
  try {
    const folderId = await googleDriveService.createFolder(folderName);
    userStateManager.setCurrentFolder(userId, folderName, folderId);

    await client.replyMessage(replyToken, {
      type: 'text',
      text: `✅ 已建立資料夾「${folderName}」並設為當前上傳目標`
    });
  } catch (error) {
    console.error('建立資料夾錯誤:', error);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `❌ 建立資料夾失敗：${error.message}`
    });
  }
}

// 處理設定命名
async function handleSetNaming(namePrefix, replyToken, client, userId) {
  userStateManager.setNamingPrefix(userId, namePrefix);

  await client.replyMessage(replyToken, {
    type: 'text',
    text: `✅ 已設定命名規則：${namePrefix}_001.jpg, ${namePrefix}_002.jpg...`
  });
}

// 處理設定模式
async function handleSetMode(mode, replyToken, client, userId) {
  userStateManager.setMode(userId, mode);
  const modeText = mode === 'original' ? '原始模式（高畫質大檔案）' : '一般模式（Line壓縮版本）';

  await client.replyMessage(replyToken, {
    type: 'text',
    text: `📸 已切換為${modeText}`
  });
}

// 處理狀態查詢
async function handleStatus(replyToken, client, userId) {
  const userState = userStateManager.getUserState(userId);
  const modeText = userState.mode === 'original' ? '原始模式' : '一般模式';

  const statusText = `📊 當前狀態：
🗂 資料夾：${userState.currentFolder || '未設定'}
🏷 命名：${userState.namingPrefix || '未設定'}_XXX.jpg
📸 模式：${modeText}
📁 已上傳：${userState.photoCount} 張照片`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: statusText
  });
}

// 處理說明
async function handleHelp(replyToken, client) {
  const helpText = `🤖 Line照片上傳助理

📝 可用指令：
• 建立資料夾：[名稱] - 建立新資料夾
• 設定命名：[前綴] - 設定照片命名規則
• 原始模式 - 切換為高畫質模式
• 一般模式 - 切換為壓縮模式
• 狀態 - 查看當前設定
• 說明 - 顯示此說明

📸 使用方式：
1. 先建立資料夾
2. 設定命名規則（可選）
3. 選擇上傳模式
4. 直接傳送照片即可自動上傳`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: helpText
  });
}

// 處理關注事件
async function handleFollow(event, client, userId) {
  const welcomeText = `🎉 歡迎使用 Line照片上傳助理！

我可以幫您：
• 將照片自動上傳到 Google Drive
• 建立並管理資料夾
• 批次命名照片
• 選擇原始或壓縮模式

輸入 "hi" 開始使用！`;

  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: welcomeText
  });
}

// 顯示主選單
async function showMainMenu(replyToken, client, userId) {
  userStateManager.resetToMain(userId);

  const menuText = `👋 請選擇操作：
1️⃣ 選擇現有資料夾
2️⃣ 創建新資料夾
3️⃣ 查看狀態
4️⃣ 說明

請輸入數字選擇`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: menuText
  });
}

// 處理導航輸入
async function handleNavigationInput(text, replyToken, client, userId, userState) {
  switch (userState.navigationState) {
    case 'selectFolder':
      await handleFolderSelection(text, replyToken, client, userId, userState);
      break;
    case 'folderOptions':
      await handleFolderOptions(text, replyToken, client, userId, userState);
      break;
    case 'inFolder':
      await handleInFolderAction(text, replyToken, client, userId, userState);
      break;
    case 'createFolder':
      await handleCreateFolderName(text, replyToken, client, userId);
      break;
    default:
      await showMainMenu(replyToken, client, userId);
  }
}

// 處理選擇現有資料夾
async function handleSelectExistingFolder(replyToken, client, userId) {
  try {
    const userState = userStateManager.getUserState(userId);
    const currentFolderId = userState.currentBrowseFolderId;
    const folders = await googleDriveService.listFolders(currentFolderId);

    if (folders.length === 0) {
      const pathString = userStateManager.getCurrentPathString(userId);
      await client.replyMessage(replyToken, {
        type: 'text',
        text: `❌ 在「${pathString}」中沒有找到任何資料夾\n\n輸入 "hi" 返回主選單`
      });
      return;
    }

    const pathString = userStateManager.getCurrentPathString(userId);
    let folderListText = `📁 當前位置：${pathString}\n\n`;

    // 如果不在根目錄，顯示返回上一層選項
    if (userState.navigationPath.length > 0) {
      folderListText += '⬆️ 0. 返回上一層\n';
    }

    folders.forEach((folder, index) => {
      folderListText += `📂 ${index + 1}. ${folder.name}\n`;
    });

    folderListText += '\n請選擇資料夾 (輸入數字)';

    userStateManager.setNavigationState(userId, 'selectFolder', folders);

    await client.replyMessage(replyToken, {
      type: 'text',
      text: folderListText
    });
  } catch (error) {
    console.error('獲取資料夾列表失敗:', error);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '❌ 獲取資料夾列表失敗，請稍後再試。\n\n輸入 "hi" 返回主選單'
    });
  }
}

// 處理資料夾選擇
async function handleFolderSelection(text, replyToken, client, userId, userState) {
  const selection = parseInt(text);

  // 處理返回上一層
  if (selection === 0 && userState.navigationPath.length > 0) {
    userStateManager.goBack(userId);
    await handleSelectExistingFolder(replyToken, client, userId);
    return;
  }

  const folderIndex = selection - 1;

  if (isNaN(folderIndex) || folderIndex < 0 || folderIndex >= userState.folderList.length) {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '❌ 無效的選擇，請輸入正確的數字。'
    });
    return;
  }

  const selectedFolder = userState.folderList[folderIndex];

  // 顯示資料夾選項：進入瀏覽 or 設為上傳目標
  userStateManager.setNavigationState(userId, 'folderOptions', null, selectedFolder);

  const pathString = userStateManager.getCurrentPathString(userId);
  const optionText = `📂 已選擇「${selectedFolder.name}」
📍 位置：${pathString}

1️⃣ 進入此資料夾瀏覽
2️⃣ 設為照片上傳目標
3️⃣ 返回資料夾列表

請選擇操作 (輸入數字)`;

  await client.replyMessage(replyToken, {
    type: 'text',
    text: optionText
  });
}

// 處理資料夾內操作
async function handleInFolderAction(text, replyToken, client, userId, userState) {
  switch (text) {
    case '1':
      await client.replyMessage(replyToken, {
        type: 'text',
        text: `📸 已準備好接收照片！\n當前資料夾：${userState.currentFolder}\n\n請直接傳送照片即可自動上傳`
      });
      break;
    case '2':
      userStateManager.setNavigationState(userId, 'createFolder');
      await client.replyMessage(replyToken, {
        type: 'text',
        text: `📝 在「${userState.currentFolder}」中創建子資料夾\n\n請輸入新資料夾名稱：`
      });
      break;
    case '3':
      await showMainMenu(replyToken, client, userId);
      break;
    default:
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '❌ 無效的選擇，請輸入 1、2 或 3'
      });
  }
}

// 開始創建資料夾流程
async function handleStartCreateFolder(replyToken, client, userId) {
  userStateManager.setNavigationState(userId, 'createFolder');

  await client.replyMessage(replyToken, {
    type: 'text',
    text: '📝 請輸入新資料夾名稱：'
  });
}

// 處理資料夾選項
async function handleFolderOptions(text, replyToken, client, userId, userState) {
  const selectedFolder = userState.pendingAction;

  switch (text) {
    case '1': // 進入此資料夾瀏覽
      userStateManager.enterFolder(userId, selectedFolder.id, selectedFolder.name);
      await handleSelectExistingFolder(replyToken, client, userId);
      break;

    case '2': // 設為照片上傳目標
      userStateManager.setCurrentFolder(userId, selectedFolder.name, selectedFolder.id);
      userStateManager.setNavigationState(userId, 'inFolder');

      const pathString = userStateManager.getCurrentPathString(userId);
      const inFolderText = `✅ 已設定「${selectedFolder.name}」為上傳目標
📍 位置：${pathString}

1️⃣ 在此上傳照片
2️⃣ 創建子資料夾
3️⃣ 返回主選單

請選擇操作 (輸入數字)`;

      await client.replyMessage(replyToken, {
        type: 'text',
        text: inFolderText
      });
      break;

    case '3': // 返回資料夾列表
      await handleSelectExistingFolder(replyToken, client, userId);
      break;

    default:
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '❌ 無效的選擇，請輸入 1、2 或 3'
      });
  }
}

// 處理創建資料夾名稱輸入
async function handleCreateFolderName(text, replyToken, client, userId) {
  const folderName = text.trim();

  if (!folderName) {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '❌ 資料夾名稱不能為空，請重新輸入：'
    });
    return;
  }

  const userState = userStateManager.getUserState(userId);
  const parentFolderId = userState.currentBrowseFolderId || userState.currentFolderId;

  try {
    const newFolder = await googleDriveService.createFolder(folderName, parentFolderId);
    userStateManager.setCurrentFolder(userId, folderName, newFolder.id);
    userStateManager.setNavigationState(userId, 'inFolder');

    const pathString = userStateManager.getCurrentPathString(userId);
    const successText = `✅ 已創建並進入「${folderName}」資料夾
📍 位置：${pathString}

1️⃣ 在此上傳照片
2️⃣ 創建子資料夾
3️⃣ 返回主選單

請選擇操作 (輸入數字)`;

    await client.replyMessage(replyToken, {
      type: 'text',
      text: successText
    });
  } catch (error) {
    console.error('創建資料夾失敗:', error);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `❌ 創建資料夾失敗：${error.message}\n\n輸入 "hi" 返回主選單`
    });
    userStateManager.resetToMain(userId);
  }
}