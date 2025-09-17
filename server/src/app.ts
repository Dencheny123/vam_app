import express from 'express';
import dotenv from 'dotenv';
import serverConfig from './configs/serverConfig.js';
import indexRouter from './routes/index.route.js';
import { NotificationScheduler } from './utils/scheduler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к папке с изображениями
const uploadsPath = path.join(__dirname, '../public/uploads');

// Статическая раздача

dotenv.config();

const expressApp = express();
serverConfig(expressApp);

expressApp.use('/api', indexRouter);
expressApp.use('/uploads', express.static(uploadsPath));

expressApp.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3001;

expressApp.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`,
  );
  console.log(
    `JWT Secrets: ${
      process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET
        ? 'Configured'
        : 'Not configured'
    }`,
  );
  
  // Запускаем планировщик уведомлений
  NotificationScheduler.start();
});