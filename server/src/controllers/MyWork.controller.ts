import { Request, Response } from 'express';
import { MyWorkService } from '../services/MyWork.service.js';
import formatResponse from '../utils/formatResponse.js';

export class MyWorkController {
  static async createMyWork(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      console.log('Files from multer:', files);
      console.log('Body from multer:', req.body);

      // Обрабатываем изображения
      const imagePaths: string[] = [];
      if (files) {
        for (const file of files) {
          const processedImages = await MyWorkService.processWorkImage(file);
          const parsedImages = JSON.parse(processedImages);
          imagePaths.push(...parsedImages);
        }
      }

      // Обрабатываем success_work
      let successWorkArray: string[] = [];
      if (req.body.success_work) {
        try {
          successWorkArray = JSON.parse(req.body.success_work);
        } catch {
          if (Array.isArray(req.body.success_work)) {
            successWorkArray = req.body.success_work;
          } else {
            successWorkArray = [req.body.success_work];
          }
        }
      }

      const workData = {
        title: req.body.title || '',
        square: req.body.square || '',
        quantity: req.body.quantity || '',
        time: req.body.time || '',
        success_work: successWorkArray,
        image: imagePaths,
      };

      console.log('Final work data:', workData);

      const result = await MyWorkService.createMyWork(workData);
      res.status(201).json(formatResponse(201, 'Работа создана', result));
    } catch (error: any) {
      console.error('Ошибка в createMyWork:', error);
      res.status(500).json(formatResponse(500, error.message || 'Ошибка сервера'));
    }
  }

  static async updateMyWork(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Неверный ID'));
        return;
      }

      const files = req.files as Express.Multer.File[] | undefined;
      console.log('Files from multer:', files);
      console.log('Body from multer:', req.body);

      // Обрабатываем новые изображения
      const newImagePaths: string[] = [];
      if (files) {
        for (const file of files) {
          const processedImages = await MyWorkService.processWorkImage(file);
          const parsedImages = JSON.parse(processedImages);
          newImagePaths.push(...parsedImages);
        }
      }

      // Обрабатываем existing_images
      let existingImages: string[] = [];
      if (req.body.existing_images) {
        try {
          existingImages = JSON.parse(req.body.existing_images);
        } catch {
          if (Array.isArray(req.body.existing_images)) {
            existingImages = req.body.existing_images;
          } else {
            existingImages = [req.body.existing_images];
          }
        }
      }

      // Обрабатываем removed_images
      let removedImages: string[] = [];
      if (req.body.removed_images) {
        try {
          removedImages = JSON.parse(req.body.removed_images);
        } catch {
          if (Array.isArray(req.body.removed_images)) {
            removedImages = req.body.removed_images;
          } else {
            removedImages = [req.body.removed_images];
          }
        }
      }

      // Обрабатываем success_work
      let successWorkArray: string[] = [];
      if (req.body.success_work) {
        try {
          successWorkArray = JSON.parse(req.body.success_work);
        } catch {
          if (Array.isArray(req.body.success_work)) {
            successWorkArray = req.body.success_work;
          } else {
            successWorkArray = [req.body.success_work];
          }
        }
      }

      const workData = {
        title: req.body.title,
        square: req.body.square,
        quantity: req.body.quantity,
        time: req.body.time,
        success_work: successWorkArray,
        newImages: newImagePaths,
        existingImages,
        removedImages,
      };

      console.log('Final update data:', workData);

      const result = await MyWorkService.updateMyWork(id, workData);
      if (!result) {
        res.status(404).json(formatResponse(404, 'Работа не найдена'));
        return;
      }
      res.status(200).json(formatResponse(200, 'Работа обновлена', result));
    } catch (error: any) {
      console.error('Ошибка в updateMyWork:', error);
      res.status(500).json(formatResponse(500, error.message || 'Ошибка сервера'));
    }
  }
  static async getAllMyWorks(req: Request, res: Response) {
    try {
      const result = await MyWorkService.getAllMyWorks();
      res.status(200).json(formatResponse(200, 'Работы успешно получены', result));
    } catch (error: any) {
      console.error('Ошибка в getAllMyWorks:', error);
      res.status(500).json(formatResponse(500, error.message || 'Ошибка сервера'));
    }
  }

  static async getMyWorkById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Некорректный ID работы'));
        return;
      }

      const result = await MyWorkService.getMyWorkById(id);
      if (!result) {
        res.status(404).json(formatResponse(404, 'Работа не найдена'));
        return;
      }
      res.status(200).json(formatResponse(200, 'Работа успешно получена', result));
    } catch (error: any) {
      console.error('Ошибка в getMyWorkById:', error);
      res.status(500).json(formatResponse(500, error.message || 'Ошибка сервера'));
    }
  }

  static async deleteMyWork(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Некорректный ID работы'));
        return;
      }

      const deleted = await MyWorkService.deleteMyWork(id);
      if (!deleted) {
        res.status(404).json(formatResponse(404, 'Работа не найдена'));
        return;
      }

      res.status(200).json(formatResponse(200, 'Работа успешно удалена'));
    } catch (error: any) {
      console.error('Ошибка в deleteMyWork:', error);
      res.status(500).json(formatResponse(500, error.message || 'Ошибка сервера'));
    }
  }
}
