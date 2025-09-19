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

// 設定信任代理
app.set('trust proxy', true);

// 中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 增加請求日誌
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Line Bot Webhook - 處理反向代理問題
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  try {
    // 重建正確的簽名驗證
    const signature = req.get('x-line-signature');
    const body = req.body;

    console.log('收到 Webhook 請求');
    console.log('Headers:', req.headers);
    console.log('Raw Body length:', body.length);
    console.log('Signature:', signature);

    // 手動進行簽名驗證
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('SHA256', config.line.channelSecret)
      .update(body)
      .digest('base64');

    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', signature);

    if (signature !== expectedSignature) {
      console.error('簽名驗證失敗');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 解析 JSON
    const parsedBody = JSON.parse(body.toString());
    console.log('Parsed Body:', parsedBody);

    const events = parsedBody.events;

    if (!events || events.length === 0) {
      console.log('沒有事件需要處理');
      return res.status(200).end();
    }

    // 處理事件
    const promises = events.map(async (event) => {
      console.log('處理事件:', event);
      return await handleMessage(event, client);
    });

    Promise.all(promises)
      .then(() => {
        console.log('所有事件處理完成');
        res.status(200).end();
      })
      .catch((error) => {
        console.error('事件處理錯誤:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });

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