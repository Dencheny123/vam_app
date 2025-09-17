import { Request, Response } from 'express';
import formatResponse from '../utils/formatResponse.js';
import { ServiceService } from '../services/Service.service.js';

export class ServiceController {
  static async getAllServices(req: Request, res: Response) {
    try {
      const services = await ServiceService.getAllService();
      res.status(200).json(formatResponse(200, 'Услуги получены', services));
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Ошибка сервера'));
    }
  }

  static async getOneService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceService.getOneService(Number(id));
      res.status(200).json(formatResponse(200, 'Услуга получена', service));
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Ошибка сервера'));
    }
  }

  static async createService(req: Request, res: Response): Promise<void> {
    try {
      const serviceData = {
        ...req.body,
        imagesPath: req.file ? `/uploads/${req.file.filename}` : null, // Change 'images' to 'imagesPath'
      };

      const result = await ServiceService.createService(serviceData);
      res.status(201).json(formatResponse(201, 'Service created', result));
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Server error'));
    }
  }

  static async updateService(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Invalid ID'));
        return;
      }

      const serviceData = {
        ...req.body,
        newImage: req.file ? `/uploads/${req.file.filename}` : undefined,
      };

      const result = await ServiceService.updateService(id, serviceData);
      res.status(200).json(formatResponse(200, 'Service updated', result));
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Server error'));
    }
  }

  static async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedService = await ServiceService.deleteService(Number(id));
      res.status(200).json(formatResponse(200, 'Услуга удалена', deletedService)); // Return the deleted service
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Ошибка сервера'));
    }
  }

  static async uploadServiceImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Логика загрузки изображения
      res.status(200).json(formatResponse(200, 'Изображение загружено'));
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Ошибка загрузки изображения'));
    }
  }

  static async deleteServiceImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Логика удаления изображения
      res.status(200).json(formatResponse(200, 'Изображение удалено'));
    } catch (error) {
      res.status(500).json(formatResponse(500, 'Ошибка удаления изображения'));
    }
  }
}
