import { Request, Response } from 'express';
import { RecordingService } from '../services/Recording.service.js';

export class RecordingController {
  static async sendMessage(req: Request, res: Response) {
    const { name, email, tel, message, personalData, oferta, mailing } = req.body;
    try {
      await RecordingService.sendMessage({ name, tel, message, personalData, oferta });
      return res
        .status(200)
        .json({ success: true, message: 'Заявка успешно отправлена' });
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка отправки заявки',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const orders = await RecordingService.getOrders();
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка получения заказов',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const order = await RecordingService.getOrderById(Number(id));
      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      return res.status(200).json(order);
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка получения заказа',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async updateOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const order = await RecordingService.updateOrder(Number(id), req.body);
      return res.status(200).json(order);
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка обновления заказа',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await RecordingService.deleteOrder(Number(id));
      return res.status(200).json({ message: 'Заказ удален успешно' });
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка удаления заказа',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async createOrder(req: Request, res: Response) {
    const {
      name,
      email,
      phone,
      message,
      personalData,
      oferta,
      mailing,
      status,
      amount,
      notes,
      whatsapp,
      telegram,
      address,
      deadline
    } = req.body;
    
    try {
      const order = await RecordingService.createOrder({
        name,
        email,
        phone,
        message,
        personalData: Boolean(personalData),
        oferta: Boolean(oferta),
        mailing: Boolean(mailing),
        status,
        amount,
        notes,
        whatsapp,
        telegram,
        address,
        deadline
      });
      
      return res.status(201).json(order);
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка создания заказа',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async updateOrdersStatus(req: Request, res: Response) {
    const { ids, status } = req.body;
    
    try {
      await RecordingService.updateOrdersStatus(ids, status);
      const updatedOrders = await RecordingService.getOrders();
      return res.status(200).json(updatedOrders.filter(order => ids.includes(order.id)));
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка массового обновления статусов',
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  static async deleteOrders(req: Request, res: Response) {
    const { ids } = req.body;
    
    try {
      await RecordingService.deleteOrders(ids);
      return res.status(200).json({
        message: 'Заказы удалены успешно',
        deletedIds: ids
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка массового удаления заказов',
        details: error instanceof Error ? error.message : error,
      });
    }
  }
}
