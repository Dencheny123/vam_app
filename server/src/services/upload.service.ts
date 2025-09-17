import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Request } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `Empty-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Для загрузки одного файла
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Для загрузки нескольких полей
export const uploads = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
});

// Утилита для получения списка файлов и их использования
export const getImageListWithUsage = async () => {
  try {
    const files = fs.readdirSync(uploadsDir);

    const usageMap = new Map();

    // Проверка использования в таблице Service
    const services = await prisma.service.findMany({
      where: { image: { not: null } },
    });
    services.forEach((service) => {
      if (service.image) {
        const filename = path.basename(service.image);
        if (files.includes(filename)) {
          usageMap.set(filename, [...(usageMap.get(filename) || []), 'Услуги']);
        }
      }
    });

    // Проверка использования в таблице My_work
    const myWorks = await prisma.my_work.findMany({
      where: { image: { not: null } },
    });
    myWorks.forEach((work) => {
      if (work.image !== null) {
        if (work.image) {
          const images = JSON.parse(work.image);
          images.forEach((image: string) => {
            const filename = path.basename(image);
            if (files.includes(filename)) {
              usageMap.set(filename, [...(usageMap.get(filename) || []), 'Портфолио']);
            }
          });
        }
      }
    });

    // Проверка использования в таблице Meta_data
    const metaData = await prisma.meta_data.findMany({
      where: {
        OR: [
          { icons_icon: { not: null } },
          { icons_shortcut: { not: null } },
          { icons_apple: { not: null } },
        ],
      },
    });
    metaData.forEach((meta) => {
      // Функция для парсинга и обработки JSON массивов
      const parseAndCheckField = (field: string | null, category: string) => {
        if (!field) return;
        
        try {
          // Пытаемся распарсить как JSON массив
          const parsedField = JSON.parse(field);
          if (Array.isArray(parsedField)) {
            parsedField.forEach((imagePath: string) => {
              const filename = path.basename(imagePath);
              if (files.includes(filename)) {
                usageMap.set(filename, [...(usageMap.get(filename) || []), category]);
              }
            });
          } else {
            // Если это одиночная строка
            const filename = path.basename(parsedField);
            if (files.includes(filename)) {
              usageMap.set(filename, [...(usageMap.get(filename) || []), category]);
            }
          }
        } catch {
          // Если не JSON, обрабатываем как обычную строку
          const filename = path.basename(field);
          if (files.includes(filename)) {
            usageMap.set(filename, [...(usageMap.get(filename) || []), category]);
          }
        }
      };

      parseAndCheckField(meta.icons_icon, 'Метаданные');
      parseAndCheckField(meta.icons_shortcut, 'Метаданные');
      parseAndCheckField(meta.icons_apple, 'Метаданные');
    });

    // Формирование результата
    return files.map((file) => ({
      filename: file,
      usedIn: usageMap.get(file) && usageMap.get(file).length > 0
        ? usageMap.get(file)
        : ['Не используется'],
      url: `http://localhost:3001/uploads/${file}`,
    }));
  } catch (error) {
    console.error('Error reading uploads directory or querying database:', error);
    return [];
  }
};

// Утилита для удаления файла
export const deleteImage = (filename: string) => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};
