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

const client = new Client(lineConfig);

// 中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Line Bot Webhook
app.post('/webhook', middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;

    const promises = events.map(async (event) => {
      console.log('收到事件:', event);
      return await handleMessage(event, client);
    });

    await Promise.all(promises);
    res.status(200).end();
  } catch (error) {
    console.error('Webhook 錯誤:', error);
    res.status(500).end();
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Line照片上傳助理'
  });
});

// 啟動伺服器
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`🤖 Line照片上傳助理已啟動`);
  console.log(`🌐 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📡 Webhook 端點: http://localhost:${PORT}/webhook`);
});

export { client };