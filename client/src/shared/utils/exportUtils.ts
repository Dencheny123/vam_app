import * as XLSX from 'xlsx';
import { OrderType } from '@/entities/recording/model/index';

// Интерфейс для опций экспорта
export interface ExportOptions {
  format: 'xlsx' | 'pdf';
  fields: string[];
  fileName?: string;
}

// Функция для преобразования заказов в данные для таблицы
const prepareOrdersData = (orders: OrderType[], fields: string[]) => {
  const headers = fields.map(field => {
    const fieldLabels: { [key: string]: string } = {
      'id': 'ID',
      'name': 'Имя',
      'phone': 'Телефон',
      'email': 'Email',
      'message': 'Сообщение',
      'status': 'Статус',
      'amount': 'Сумма',
      'notes': 'Заметки',
      'whatsapp': 'WhatsApp',
      'telegram': 'Telegram',
      'address': 'Адрес',
      'personalData': 'Согласие на ПД',
      'oferta': 'Принятие оферты',
      'mailing': 'Согласие на рассылку',
      'createdAt': 'Дата создания',
      'updatedAt': 'Дата обновления'
    };
    return fieldLabels[field] || field;
  });

  const data = orders.map(order => {
    const row: any[] = [];
    fields.forEach(field => {
      switch (field) {
        case 'status':
          row.push(getStatusText(order[field]));
          break;
        case 'personalData':
        case 'oferta':
        case 'mailing':
          row.push(order[field] ? 'Да' : 'Нет');
          break;
        case 'createdAt':
        case 'updatedAt':
          row.push(new Date(order[field]).toLocaleString('ru-RU'));
          break;
        case 'amount':
          row.push(order.amount ? `${order.amount} ₽` : 'Не указана');
          break;
        default:
          row.push(order[field as keyof OrderType] || '');
      }
    });
    return row;
  });

  return { headers, data };
};

// Функция для получения текста статуса
const getStatusText = (status: OrderType['status']) => {
  switch (status) {
    case 'NEW': return 'Новый';
    case 'IN_PROGRESS': return 'В работе';
    case 'COMPLETED': return 'Завершен';
    case 'CANCELLED': return 'Отменен';
    default: return status;
  }
};

// Экспорт в Excel
export const exportToExcel = (orders: OrderType[], options: ExportOptions) => {
  const { headers, data } = prepareOrdersData(orders, options.fields);
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Настройка ширины колонок
  const colWidths = headers.map((_, index) => {
    const maxLength = Math.max(
      ...data.map(row => String(row[index] || '').length),
      headers[index].length
    );
    return Math.min(Math.max(maxLength * 8, 80), 300);
  });
  
  worksheet['!cols'] = colWidths.map(width => ({ width }));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');
  
  let fileName = options.fileName || `заказы_${new Date().toISOString().split('T')[0]}`;
  if (!fileName.endsWith('.xlsx')) {
    fileName += '.xlsx';
  }
  XLSX.writeFile(workbook, fileName);
};

// Основная функция экспорта
export const exportOrders = (orders: OrderType[], options: ExportOptions) => {
  if (orders.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }

  try {
    switch (options.format) {
      case 'xlsx':
        exportToExcel(orders, options);
        break;
      default:
        throw new Error('Неизвестный формат экспорта');
    }
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
    alert('Произошла ошибка при экспорте данных');
  }
};

// Утилита для выбора полей экспорта
export const availableFields = [
  { value: 'id', label: 'ID', default: false },
  { value: 'name', label: 'Имя', default: true },
  { value: 'phone', label: 'Телефон', default: true },
  { value: 'email', label: 'Email', default: true },
  { value: 'message', label: 'Сообщение', default: false },
  { value: 'status', label: 'Статус', default: true },
  { value: 'amount', label: 'Сумма', default: true },
  { value: 'notes', label: 'Заметки', default: false },
  { value: 'whatsapp', label: 'WhatsApp', default: true },
  { value: 'telegram', label: 'Telegram', default: true },
  { value: 'address', label: 'Адрес', default: true },
  { value: 'personalData', label: 'Согласие на ПД', default: false },
  { value: 'oferta', label: 'Принятие оферты', default: false },
  { value: 'mailing', label: 'Согласие на рассылку', default: false },
  { value: 'createdAt', label: 'Дата создания', default: true },
  { value: 'updatedAt', label: 'Дата обновления', default: false }
];