import { PrismaClient } from '../generated/prisma/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import { Request } from 'express';
import { processMyWorkImage, cleanupTempFile } from '../utils/imageProcessor.js';

const prisma = new PrismaClient();

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
    const uniqueName = `MyWork-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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

// Для загрузки нескольких полей
export const uploads = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
});


interface MyWorkData {
  title?: string;
  square?: string;
  quantity?: string;
  time?: string;
  success_work?: string[];
  image?: string[];
}

interface UpdateWorkData {
  title?: string;
  square?: string;
  quantity?: string;
  time?: string;
  success_work?: string[];
  newImages?: string[];
  existingImages?: string[];
  removedImages?: string[];
}

export class MyWorkService {
  static async createMyWork(data: MyWorkData) {
    return await prisma.my_work.create({
      data: {
        title: data.title || '',
        square: data.square || '',
        quantity: data.quantity || '',
        time: data.time || '',
        success_work: JSON.stringify(data.success_work || []),
        image: JSON.stringify(data.image || []),
      },
    });
  }

  static async updateMyWork(id: number, data: UpdateWorkData) {
    const currentWork = await prisma.my_work.findUnique({ where: { id } });
    if (!currentWork) return null;

    // Получаем текущие изображения
    let currentImages: string[] = [];
    try {
      currentImages = currentWork.image ? JSON.parse(currentWork.image) : [];
    } catch {
      currentImages = [];
    }

    // Удаляем изображения, которые нужно удалить
    const imagesAfterRemoval = currentImages.filter(
      (img) => !data.removedImages?.includes(img),
    );

    // Добавляем новые изображения
    const finalImages = [...imagesAfterRemoval, ...(data.newImages || [])];

    // Удаляем физически удаленные файлы
    if (data.removedImages && data.removedImages.length > 0) {
      for (const img of data.removedImages) {
        const imagePath = path.join(uploadsDir, path.basename(img));
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (error) {
            console.error('Ошибка при удалении файла:', error);
          }
        }
      }
    }

    const finalSuccessWork = data.success_work
      ? data.success_work
      : currentWork.success_work
      ? JSON.parse(currentWork.success_work)
      : [];

    return prisma.my_work.update({
      where: { id },
      data: {
        title: data.title ?? currentWork.title,
        square: data.square ?? currentWork.square,
        quantity: data.quantity ?? currentWork.quantity,
        time: data.time ?? currentWork.time,
        success_work: JSON.stringify(finalSuccessWork),
        image: JSON.stringify(finalImages),
      },
    });
  }

  static async getAllMyWorks() {
    const works = await prisma.my_work.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return works.map((work) => ({
      ...work,
      image: work.image ? JSON.parse(work.image).map((img: string) => `${img}`) : [],
      success_work: work.success_work ? JSON.parse(work.success_work) : [],
    }));
  }

  static async getMyWorkById(id: number) {
    const work = await prisma.my_work.findUnique({ where: { id } });
    if (!work) return null;

    return {
      ...work,
      image: work.image ? JSON.parse(work.image).map((img: string) => `${img}`) : [],
      success_work: work.success_work ? JSON.parse(work.success_work) : [],
    };
  }

  static async deleteMyWork(id: number) {
    const work = await prisma.my_work.findUnique({ where: { id } });
    if (!work) return null;

    // Удаляем связанные изображения
    if (work.image) {
      let images: string[] = [];
      try {
        images = JSON.parse(work.image);
      } catch {
        images = [];
      }
      for (const img of images) {
        const imagePath = path.join(uploadsDir, path.basename(img));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    return await prisma.my_work.delete({ where: { id } });
  }

  // Метод для обработки изображений работ
  static async processWorkImage(imageFile: Express.Multer.File): Promise<string> {
    const tempPath = path.join(uploadsDir, imageFile.filename);
    try {
      const processedImages = await processMyWorkImage(tempPath);
      return JSON.stringify(processedImages);
    } finally {
      cleanupTempFile(tempPath);
    }
  }
}
