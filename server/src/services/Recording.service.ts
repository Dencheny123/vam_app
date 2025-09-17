import { PrismaClient } from '../generated/prisma/index.js';
import { notificationService } from './Notification.service.js';

const prisma = new PrismaClient();

export class RecordingService {
  static async sendMessage({
    name,
    tel,
    message,
    personalData,
    oferta,
    address,
  }: {
    name: string;
    tel: string;
    message: string;
    personalData: string | boolean;
    oferta: string | boolean;
    address?: string;
  }) {
    // Сохраняем заказ в базу данных
    const order = await prisma.order.create({
      data: {
        name,
        email: '', // email не передается в текущей форме
        phone: tel,
        message: message || '',
        personalData: typeof personalData === 'string' ? personalData === 'on' : Boolean(personalData),
        oferta: typeof oferta === 'string' ? oferta === 'on' : Boolean(oferta),
        mailing: false, // mailing не передается в текущей форме
        status: 'NEW',
        amount: 0,
        notes: '',
        whatsapp: '',
        telegram: '',
        address: address || ''
      }
    });

    // Отправляем уведомление о новом заказе
    try {
      await notificationService.notifyNewOrder(order.id);
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
      // Не прерываем выполнение, если уведомление не отправилось
    }
  }

  static async getOrders() {
    return await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async getOrderById(id: number) {
    return await prisma.order.findUnique({
      where: { id }
    });
  }

  static async updateOrder(id: number, data: any) {
    const updateData: any = {
      ...data,
      // Обеспечиваем корректное обновление boolean полей
      personalData: data.personalData !== undefined ? Boolean(data.personalData) : undefined,
      oferta: data.oferta !== undefined ? Boolean(data.oferta) : undefined,
      mailing: data.mailing !== undefined ? Boolean(data.mailing) : undefined,
      // Обеспечиваем корректное обновление числовых полей
      amount: data.amount !== undefined ? (data.amount !== null ? Number(data.amount) : null) : undefined
    };

    // Обрабатываем поле deadline - преобразуем строку в Date объект
    if (data.deadline !== undefined) {
      if (data.deadline === null || data.deadline === '') {
        updateData.deadline = null;
        updateData.deadlineSetAt = null;
      } else {
        updateData.deadline = new Date(data.deadline);
        updateData.deadlineSetAt = new Date();
      }
    }

    return await prisma.order.update({
      where: { id },
      data: updateData
    });
  }

  static async deleteOrder(id: number) {
    // Сначала удаляем связанные уведомления
    await prisma.notificationHistory.deleteMany({
      where: { orderId: id }
    });
    
    // Затем удаляем заказ
    return await prisma.order.delete({
      where: { id }
    });
  }

  static async createOrder(data: {
    name: string;
    email?: string;
    phone: string;
    message?: string;
    personalData: boolean;
    oferta: boolean;
    mailing?: boolean;
    status?: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    amount?: number;
    notes?: string;
    whatsapp?: string;
    telegram?: string;
    address?: string;
    deadline?: string;
  }) {
    const order = await prisma.order.create({
      data: {
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        message: data.message || '',
        personalData: data.personalData,
        oferta: data.oferta,
        mailing: data.mailing || false,
        status: data.status || 'NEW',
        amount: data.amount || 0,
        notes: data.notes || '',
        whatsapp: data.whatsapp || '',
        telegram: data.telegram || '',
        address: data.address || '',
        deadline: data.deadline ? new Date(data.deadline) : null,
        deadlineSetAt: data.deadline ? new Date() : null
      }
    });

    // Отправляем уведомление о новом заказе
    try {
      await notificationService.notifyNewOrder(order.id);
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
      // Не прерываем выполнение, если уведомление не отправилось
    }

    return order;
  }

  static async updateOrdersStatus(ids: number[], status: OrderType['status']) {
    return await prisma.order.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status
      }
    });
  }

  static async deleteOrders(ids: number[]) {
    // Сначала удаляем связанные уведомления
    await prisma.notificationHistory.deleteMany({
      where: {
        orderId: {
          in: ids
        }
      }
    });
    
    // Затем удаляем заказы
    return await prisma.order.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }
}

type OrderType = {
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
};