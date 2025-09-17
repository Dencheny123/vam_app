import { Request, Response } from 'express';
import { FAQService } from '../services/FAQ.service.js';
import formatResponse from '../utils/formatResponse.js';

export class FAQController {
  static async createFAQ(req: Request, res: Response) {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json(formatResponse(400, 'Неверный формат данных'));
      }

      const result = await FAQService.createFAQ(req.body);
      return res.status(201).json(formatResponse(201, 'FAQ успешно создан', result));
    } catch (error) {
      console.error('Create FAQ error:', error);
      return res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async getAllFAQs(req: Request, res: Response) {
    try {
      const result = await FAQService.getAllFAQs();
      return res.status(200).json(formatResponse(200, 'FAQs успешно получены', result || []));
    } catch (error) {
      console.error('Get all FAQs error:', error);
      return res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async getFAQById(req: Request, res: Response) {
    try {
      const id = +req.params.id;
      if (isNaN(id)) {
        return res.status(400).json(formatResponse(400, 'Некорректный ID FAQ'));
      }

      const result = await FAQService.getFAQById(id);
      if (!result) {
        return res.status(404).json(formatResponse(404, 'FAQ не найден'));
      }
      return res.status(200).json(formatResponse(200, 'FAQ успешно получен', result));
    } catch (error) {
      console.error('Get FAQ by id error:', error);
      return res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async updateFAQ(req: Request, res: Response) {
    try {
      const id = +req.params.id;
      if (isNaN(id)) {
        return res.status(400).json(formatResponse(400, 'Некорректный ID FAQ'));
      }

      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json(formatResponse(400, 'Неверный формат данных'));
      }

      const result = await FAQService.updateFAQ(id, req.body);
      return res.status(200).json(formatResponse(200, 'FAQ успешно обновлён', result));
    } catch (error) {
      console.error('Update FAQ error:', error);
      return res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async deleteFAQ(req: Request, res: Response) {
    try {
      const id = +req.params.id;
      if (isNaN(id)) {
        return res.status(400).json(formatResponse(400, 'Некорректный ID FAQ'));
      }

      await FAQService.deleteFAQ(id);
      return res.status(200).json(formatResponse(200, 'FAQ успешно удалён'));
    } catch (error) {
      console.error('Delete FAQ error:', error);
      return res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }
}