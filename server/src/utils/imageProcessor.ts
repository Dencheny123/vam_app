import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');

// Интерфейс для параметров ресайза
interface ResizeOptions {
  width: number;
  height: number;
  format?: keyof sharp.FormatEnum;
  quality?: number;
  fit?: keyof sharp.FitEnum;
  position?: keyof sharp.GravityEnum;
  background?: string;
}

// Основная функция для обработки изображения
export const processImage = async (
  inputPath: string,
  outputOptions: ResizeOptions[],
  name: string
): Promise<string[]> => {
  const results: string[] = [];
  const inputExt = path.extname(inputPath).toLowerCase();

  // Если файл имеет расширение .ico, создаем 3 одинаковые копии
  if (inputExt === '.ico') {
    const outputFilename = `${name}-${Date.now()}-${Math.round(Math.random() * 1e9)}.ico`;
    
    try {
      // Создаем 3 одинаковые копии ICO файла
      for (let i = 0; i < 3; i++) {
        const finalOutputFilename = i === 0 ? outputFilename : `${name}-${Date.now()}-${Math.round(Math.random() * 1e9)}.ico`;
        const outputPath = path.join(uploadsDir, finalOutputFilename);
        
        // Копируем ICO файл без обработки
        fs.copyFileSync(inputPath, outputPath);
        results.push(`/uploads/${finalOutputFilename}`);
      }
      console.log('ICO files copied successfully:', outputFilename);
    } catch (error) {
      console.error('Error copying ICO files:', error);
      throw error;
    }
    
    return results;
  }

  // Для остальных форматов используем Sharp
  for (const options of outputOptions) {
    const {
      width,
      height,
      format = 'jpeg',
      quality = 80,
      fit = 'cover',
      position = 'center',
      background = '#00000000'
    } = options;
    
    const outputFilename = `${name}-${Date.now()}-${Math.round(Math.random() * 1e9)}-${width}x${height}.${format}`;
    const outputPath = path.join(uploadsDir, outputFilename);

    try {
      const sharpInstance = sharp(inputPath);
      
      // Для форматов без поддержки прозрачности добавляем белый фон
      if (format !== 'png' && format !== 'webp' && format !== 'gif') {
        sharpInstance.flatten({ background: background });
      }

      await sharpInstance
        .resize(width, height, {
          fit: fit,
          position: position,
          background: background
        })
        .toFormat(format, {
          quality: quality,
          ...(format === 'png' ? { compressionLevel: 9 } : {}),
          ...(format === 'webp' ? { lossless: false } : {})
        })
        .toFile(outputPath);

      results.push(`/uploads/${outputFilename}`);
    } catch (error) {
      console.error(`Error processing image for ${width}x${height}:`, error);
      throw error;
    }
  }

  return results;
};

// Функции для конкретных типов изображений

// MetaData иконки - сохраняем пропорции, добавляем прозрачный фон
export const processMetaDataIcons = async (inputPath: string): Promise<string[]> => {
  const options: ResizeOptions[] = [
    { width: 32, height: 32, format: 'png', quality: 100, fit: 'contain', background: 'transparent' },
    { width: 16, height: 16, format: 'png', quality: 100, fit: 'contain', background: 'transparent' }
  ];
  return processImage(inputPath, options, 'icons');
};

export const processMetaDataShortcut = async (inputPath: string): Promise<string[]> => {
  const options: ResizeOptions[] = [
    { width: 192, height: 192, format: 'png', quality: 100, fit: 'contain', background: 'transparent' },
    { width: 512, height: 512, format: 'png', quality: 100, fit: 'contain', background: 'transparent' }
  ];
  return processImage(inputPath, options, 'shortcut');
};

export const processMetaDataApple = async (inputPath: string): Promise<string[]> => {
  const options: ResizeOptions[] = [
    { width: 180, height: 180, format: 'png', quality: 100, fit: 'contain', background: 'transparent' },
    { width: 152, height: 152, format: 'png', quality: 100, fit: 'contain', background: 'transparent' },
    { width: 167, height: 167, format: 'png', quality: 100, fit: 'contain', background: 'transparent' },
    { width: 120, height: 120, format: 'png', quality: 100, fit: 'contain', background: 'transparent' }
  ];
  return processImage(inputPath, options, 'apple');
};

// MyWork изображения
export const processMyWorkImage = async (inputPath: string): Promise<string[]> => {
  const options: ResizeOptions[] = [
    { width: 360, height: 240, format: 'jpeg', quality: 95 }
  ];
  return processImage(inputPath, options, 'work');
};

// Service изображения
export const processServiceImage = async (inputPath: string): Promise<string[]> => {
  const options: ResizeOptions[] = [
    { width: 342, height: 500, format: 'jpeg', quality: 95, fit: 'cover', background: '#FFFFFF' }
  ];
  return processImage(inputPath, options, 'service');
};

// Удаление временного файла
export const cleanupTempFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};