import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Request } from 'express';
import {
  processMetaDataIcons,
  processMetaDataShortcut,
  processMetaDataApple,
  cleanupTempFile,
} from '../utils/imageProcessor.js';

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
    const uniqueName = `MetaData-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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
export type MetaData = {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  author_name?: string | null;
  nataliaBase?: string | null;
  alternates?: string | null;
  openGraph_title?: string | null;
  openGraph_description?: string | null;
  openGraph_url?: string | null;
  openGraph_siteName?: string | null;
  themeColor?: string | null;
  icons_icon?: string | string[] | null;
  icons_shortcut?: string | string[] | null;
  icons_apple?: string | string[] | null;
  other_geo_region?: string | null;
  other_geo_placename?: string | null;
  other_geo_position?: string | null;
  other_ICBM?: string | null;
};

export class MetaDataService {
  static async getAllMetaData() {
    const metaData = await prisma.meta_data.findMany();
    return metaData.map((metaData) => {
      const parseField = (field: string | null) => {
        if (!field) return null;
        try {
          return JSON.parse(field);
        } catch {
          // Если это не JSON, возвращаем как массив из одного элемента
          return [field];
        }
      };

      return {
        ...metaData,
        icons_icon: parseField(metaData.icons_icon),
        icons_shortcut: parseField(metaData.icons_shortcut),
        icons_apple: parseField(metaData.icons_apple),
      };
    });
  }

  static async getOneMetaData(id: number) {
    const metaData = await prisma.meta_data.findUnique({
      where: {
        id,
      },
    });
    if (!metaData) {
      return null;
    }

    const parseField = (field: string | null) => {
      if (!field) return null;
      try {
        return JSON.parse(field);
      } catch {
        // Если это не JSON, возвращаем как массив из одного элемента
        return [field];
      }
    };

    return {
      ...metaData,
      icons_icon: parseField(metaData.icons_icon),
      icons_shortcut: parseField(metaData.icons_shortcut),
      icons_apple: parseField(metaData.icons_apple),
    };
  }

  static async updateMetaData(id: number, data: MetaData) {
    // Преобразуем одиночные строки в массивы перед сохранением
    const iconsIconArray = data.icons_icon === null ? null :
      Array.isArray(data.icons_icon) ? data.icons_icon : [data.icons_icon];
    
    const iconsShortcutArray = data.icons_shortcut === null ? null :
      Array.isArray(data.icons_shortcut) ? data.icons_shortcut : [data.icons_shortcut];
    
    const iconsAppleArray = data.icons_apple === null ? null :
      Array.isArray(data.icons_apple) ? data.icons_apple : [data.icons_apple];

    return prisma.meta_data.update({
      where: { id },
      data: {
        ...data,
        icons_icon: iconsIconArray === null ? null : JSON.stringify(iconsIconArray),
        icons_shortcut: iconsShortcutArray === null ? null : JSON.stringify(iconsShortcutArray),
        icons_apple: iconsAppleArray === null ? null : JSON.stringify(iconsAppleArray),
      },
    });
  }

  // Метод для обработки иконок - возвращаем массив путей
  static async processIcons(imageFile: Express.Multer.File): Promise<string[]> {
    console.log('Starting processIcons with file:', imageFile.filename);
    const tempPath = path.join(uploadsDir, imageFile.filename);
    console.log('Temp path:', tempPath);

    try {
      // Проверяем, что файл существует перед обработкой
      if (!fs.existsSync(tempPath)) {
        throw new Error(`Temp file not found: ${tempPath}`);
      }

      const processedImages = await processMetaDataIcons(tempPath);
      console.log('Processed icons result:', processedImages);

      if (processedImages.length === 0) {
        throw new Error('No images were processed');
      }

      return processedImages;
    } catch (error) {
      console.error('Error processing icons:', error);
      throw new Error(
        `Failed to process icons: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      if (fs.existsSync(tempPath)) {
        cleanupTempFile(tempPath);
      }
    }
  }

  // Метод для обработки shortcut иконок - возвращаем массив путей
  static async processShortcut(imageFile: Express.Multer.File): Promise<string[]> {
    console.log('Starting processShortcut with file:', imageFile.filename);
    const tempPath = path.join(uploadsDir, imageFile.filename);
    console.log('Temp path:', tempPath);

    try {
      if (!fs.existsSync(tempPath)) {
        throw new Error(`Temp file not found: ${tempPath}`);
      }

      const processedImages = await processMetaDataShortcut(tempPath);
      console.log('Processed shortcut result:', processedImages);

      if (processedImages.length === 0) {
        throw new Error('No images were processed');
      }

      return processedImages;
    } catch (error) {
      console.error('Error processing shortcut:', error);
      throw new Error(
        `Failed to process shortcut: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      if (fs.existsSync(tempPath)) {
        cleanupTempFile(tempPath);
      }
    }
  }

  // Метод для обработки apple иконок - возвращаем массив путей
  static async processApple(imageFile: Express.Multer.File): Promise<string[]> {
    console.log('Starting processApple with file:', imageFile.filename);
    const tempPath = path.join(uploadsDir, imageFile.filename);
    console.log('Temp path:', tempPath);

    try {
      if (!fs.existsSync(tempPath)) {
        throw new Error(`Temp file not found: ${tempPath}`);
      }

      const processedImages = await processMetaDataApple(tempPath);
      console.log('Processed apple result:', processedImages);

      if (processedImages.length === 0) {
        throw new Error('No images were processed');
      }

      return processedImages;
    } catch (error) {
      console.error('Error processing apple icons:', error);
      throw new Error(
        `Failed to process apple icons: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      if (fs.existsSync(tempPath)) {
        cleanupTempFile(tempPath);
      }
    }
  }
}
