// 用戶狀態管理服務
class UserStateManager {
  constructor() {
    this.userStates = new Map();
  }

  // 取得用戶狀態
  getUserState(userId) {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        userId: userId,
        currentFolder: null,
        currentFolderId: null,
        photoCount: 0,
        createdAt: new Date(),
      });
    }
    return this.userStates.get(userId);
  }

  // 設定當前資料夾
  setCurrentFolder(userId, folderName, folderId) {
    const state = this.getUserState(userId);
    state.currentFolder = folderName;
    state.currentFolderId = folderId;
    this.userStates.set(userId, state);
  }

  // 增加照片計數
  incrementPhotoCount(userId) {
    const state = this.getUserState(userId);
    state.photoCount += 1;
    this.userStates.set(userId, state);
    return state.photoCount;
  }

  // 生成檔案名稱
  generateFileName(userId, originalExtension = 'jpg') {
    const state = this.getUserState(userId);
    const count = this.incrementPhotoCount(userId);
    const countStr = count.toString().padStart(3, '0');

    if (state.namingPrefix) {
      return `${state.namingPrefix}_${countStr}.${originalExtension}`;
    } else {
      // 使用當天日期作為前綴 (YYYY-MM-DD 格式)
      const today = new Date().toISOString().split('T')[0];
      return `${today}_${countStr}.${originalExtension}`;
    }
  }

  // 清除用戶狀態
  clearUserState(userId) {
    this.userStates.delete(userId);
  }

  // 取得所有用戶狀態（用於調試）
  getAllStates() {
    return Object.fromEntries(this.userStates);
  }
}

// 建立單例實例
export const userStateManager = new UserStateManager();
