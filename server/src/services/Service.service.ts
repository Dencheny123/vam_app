import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import { Request } from 'express';
import { processServiceImage, cleanupTempFile } from '../utils/imageProcessor.js';

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
    const uniqueName = `Service-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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

export class ServiceService {
  static async getAllService() {
    return await prisma.service.findMany();
  }

  static async getOneService(id: number) {
    return await prisma.service.findUnique({ where: { id } });
  }

  static async createService(data: any) {
    let processedImagePath = data.imagesPath || null;
    
    if (processedImagePath) {
      processedImagePath = await this.processServiceImage(processedImagePath);
    }

    return await prisma.service.create({
      data: {
        service: data.service,
        description: data.description,
        image: processedImagePath,
      },
    });
  }

  static async updateService(id: number, data: any) {
    const currentService = await prisma.service.findUnique({ where: { id } });

    let newImagePath = data.newImage || currentService?.image;

    if (data.newImage && data.newImage !== currentService?.image) {
      // Обрабатываем новое изображение
      newImagePath = await this.processServiceImage(data.newImage);
      
      // Удаляем старое изображение, если оно существует
      if (currentService?.image) {
        this.deleteImage(currentService.image);
      }
    }

    return await prisma.service.update({
      where: { id },
      data: {
        service: data.service,
        description: data.description,
        image: newImagePath,
      },
    });
  }

  static async deleteService(id: number) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new Error('Service not found');

    if (service.image) {
      this.deleteImage(service.image);
    }

    return await prisma.service.delete({ where: { id } });
  }

  static deleteImage(imagePath: string) {
    const fullPath = path.join(uploadsDir, path.basename(imagePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  static async processServiceImage(imagePath: string): Promise<string> {
    try {
      // Получаем только имя файла из пути
      const filename = path.basename(imagePath);
      const fullImagePath = path.join(uploadsDir, filename);
      
      // Проверяем, существует ли файл
      if (!fs.existsSync(fullImagePath)) {
        console.error('File does not exist:', fullImagePath);
        return imagePath; // возвращаем оригинальный путь
      }
      
      const processedImagePaths = await processServiceImage(fullImagePath);
      // Возвращаем первый (и единственный) обработанный путь
      if (processedImagePaths.length > 0) {
        // Удаляем оригинальное изображение после успешной обработки
        if (fs.existsSync(fullImagePath)) {
          fs.unlinkSync(fullImagePath);
        }
        return processedImagePaths[0];
      }
      return imagePath;
    } catch (error) {
      console.error('Error processing service image:', error);
      // В случае ошибки возвращаем оригинальный путь (файл не удаляем)
      return imagePath;
    }
  }
}

