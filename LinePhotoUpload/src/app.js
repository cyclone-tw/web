import express from 'express';
import { middleware, Client } from '@line/bot-sdk';
import { config } from '../config/config.js';
import { handleMessage } from './controllers/messageController.js';

const app = express();

// Line Bot 設定
const lineConfig = {
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret,
};

let client;
try {
  client = new Client(lineConfig);
  console.log('Line Bot Client 初始化成功');
} catch (error) {
  console.error('Line Bot Client 初始化失敗:', error);
}

// 中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 增加請求日誌
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Line Bot Webhook - 增加更詳細的錯誤處理
app.post('/webhook', (req, res, next) => {
  // 先檢查基本的請求
  console.log('收到 Webhook 請求');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  // 使用 Line 中介軟體
  middleware(lineConfig)(req, res, next);
}, async (req, res) => {
  try {
    const events = req.body.events;

    if (!events || events.length === 0) {
      console.log('沒有事件需要處理');
      return res.status(200).end();
    }

    const promises = events.map(async (event) => {
      console.log('處理事件:', event);
      return await handleMessage(event, client);
    });

    await Promise.all(promises);
    console.log('所有事件處理完成');
    res.status(200).end();
  } catch (error) {
    console.error('Webhook 處理錯誤:', error);
    console.error('錯誤堆疊:', error.stack);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 為 GET 請求到 webhook 端點提供回應（測試用）
app.get('/webhook', (req, res) => {
  res.json({
    message: 'Line Bot Webhook 端點',
    method: 'POST',
    status: 'ready'
  });
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Line照片上傳助理',
    port: config.app.port,
    lineBot: client ? 'connected' : 'disconnected'
  });
});

// 錯誤處理中介軟體
app.use((error, req, res, next) => {
  console.error('應用程式錯誤:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  });
});

// 啟動伺服器
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`🤖 Line照片上傳助理已啟動`);
  console.log(`🌐 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📡 Webhook 端點: http://localhost:${PORT}/webhook`);
  console.log(`💊 健康檢查: http://localhost:${PORT}/health`);
});

export { client };