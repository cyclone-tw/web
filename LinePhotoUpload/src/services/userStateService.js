// 用戶狀態管理服務
class UserStateManager {
  constructor() {
    this.userStates = new Map();
  }

  // 取得用戶狀態
  getUserState(userId) {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        currentFolder: null,
        currentFolderId: null,
        namingPrefix: null,
        mode: 'compressed', // 預設為一般模式
        photoCount: 0,
        createdAt: new Date(),
        // 導航狀態
        navigationState: 'main', // main, selectFolder, inFolder, createFolder
        folderList: null, // 快取資料夾清單
        pendingAction: null, // 待執行的動作
        // 階層導航
        navigationPath: [], // 導航路徑 [{name: '資料夾名', id: 'ID'}]
        currentBrowseFolderId: null, // 當前瀏覽的資料夾ID
      });
    }
    return this.userStates.get(userId);
  }

  // 設定當前資料夾
  setCurrentFolder(userId, folderName, folderId) {
    const state = this.getUserState(userId);
    state.currentFolder = folderName;
    state.currentFolderId = folderId;
    state.photoCount = 0; // 重設照片計數
    this.userStates.set(userId, state);
  }

  // 設定命名前綴
  setNamingPrefix(userId, prefix) {
    const state = this.getUserState(userId);
    state.namingPrefix = prefix;
    this.userStates.set(userId, state);
  }

  // 設定上傳模式
  setMode(userId, mode) {
    const state = this.getUserState(userId);
    state.mode = mode;
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

  // 設定導航狀態
  setNavigationState(userId, state, folderList = null, pendingAction = null) {
    const userState = this.getUserState(userId);
    userState.navigationState = state;
    if (folderList !== null) userState.folderList = folderList;
    if (pendingAction !== null) userState.pendingAction = pendingAction;
    this.userStates.set(userId, userState);
  }

  // 重設到主選單
  resetToMain(userId) {
    const state = this.getUserState(userId);
    state.navigationState = 'main';
    state.folderList = null;
    state.pendingAction = null;
    state.navigationPath = [];
    state.currentBrowseFolderId = null;
    this.userStates.set(userId, state);
  }

  // 進入資料夾
  enterFolder(userId, folderId, folderName) {
    const state = this.getUserState(userId);
    state.navigationPath.push({ id: folderId, name: folderName });
    state.currentBrowseFolderId = folderId;
    this.userStates.set(userId, state);
  }

  // 返回上一層
  goBack(userId) {
    const state = this.getUserState(userId);
    if (state.navigationPath.length > 0) {
      state.navigationPath.pop();
      state.currentBrowseFolderId = state.navigationPath.length > 0
        ? state.navigationPath[state.navigationPath.length - 1].id
        : null;
    } else {
      state.currentBrowseFolderId = null;
    }
    this.userStates.set(userId, state);
  }

  // 取得當前路徑字串
  getCurrentPathString(userId) {
    const state = this.getUserState(userId);
    if (state.navigationPath.length === 0) {
      return '根目錄';
    }
    return state.navigationPath.map(folder => folder.name).join(' > ');
  }

  // 取得所有用戶狀態（用於調試）
  getAllStates() {
    return Object.fromEntries(this.userStates);
  }
}

// 建立單例實例
export const userStateManager = new UserStateManager();