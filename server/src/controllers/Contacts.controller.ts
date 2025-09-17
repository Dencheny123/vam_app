import { Request, Response } from 'express';
import { ContactsService } from '../services/Contacts.service.js';
import formatResponse from '../utils/formatResponse.js';

export class ContactsController {
  static async createContact(req: Request, res: Response) {
    try {
      const result = await ContactsService.createContact(req.body);
      res.status(201).json(formatResponse(201, 'Контакт успешно создан', result));
    } catch (error) {
      console.error(error);
      res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async getAllContacts(req: Request, res: Response) {
    try {
      const result = await ContactsService.getAllContacts();
      res.status(200).json(formatResponse(200, 'Контакты успешно получены', result));
    } catch (error) {
      console.error(error);
      res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async getContactById(req: Request, res: Response) {
    try {
      const id = (+req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Некорректный ID контакта'));
        return;
      }

      const result = await ContactsService.getContactById(id);
      if (!result) {
        res.status(404).json(formatResponse(404, 'Контакт не найден'));
        return;
      }
      res.status(200).json(formatResponse(200, 'Контакт успешно получен', result));
    } catch (error) {
      console.error(error);
      res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async updateContact(req: Request, res: Response) {
    try {
      const id = (+req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Некорректный ID контакта'));
        return;
      }

      const result = await ContactsService.updateContact(id, req.body);
      res.status(200).json(formatResponse(200, 'Контакт успешно обновлён', result));
    } catch (error) {
      console.error(error);
      res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }

  static async deleteContact(req: Request, res: Response) {
    try {
      const id = (+req.params.id);
      if (isNaN(id)) {
        res.status(400).json(formatResponse(400, 'Некорректный ID контакта'));
        return;
      }

      await ContactsService.deleteContact(id);
      res.status(200).json(formatResponse(200, 'Контакт успешно удалён'));
    } catch (error) {
      console.error(error);
      res.status(500).json(formatResponse(500, 'Внутренняя ошибка сервера'));
    }
  }
}
