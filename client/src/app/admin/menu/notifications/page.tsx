'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Switch,
  Spin,
  Tag,
  Typography,
  Space,
  List,
} from 'antd/es';
import { message } from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  NotificationOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import { ServerResponseType } from '@/shared/types';
import styles from './page.module.css';

const { Text } = Typography;
const { Option } = Select;

interface NotificationSettings {
  email: boolean;
  push: boolean;
  telegram: boolean;
  newOrders: boolean;
  staleOrders: boolean;
  deadlineReminders: boolean;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  emailRecipients?: string | null;
  staleOrderHours: number;
}

interface NotificationHistoryResponse {
  data: NotificationHistory[];
  total: number;
  page: number;
  totalPages: number;
}

interface NotificationHistory {
  id: number;
  orderId: number;
  type: string;
  method: string;
  recipient?: string;
  message?: string;
  success: boolean;
  error?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: false,
    telegram: false,
    newOrders: true,
    staleOrders: true,
    deadlineReminders: true,
    telegramBotToken: '',
    telegramChatId: '',
    emailRecipients: '',
    staleOrderHours: 24,
  });

  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testOrderId, setTestOrderId] = useState('');
  const [testType, setTestType] = useState('new_order');
  const [testLoading, setTestLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    loadSettings();
    loadHistory();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      const response: ServerResponseType<NotificationSettings> = await axiosInstance(
        '/notifications/settings',
      );
      setSettings(response.data);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axiosInstance('/notifications/history');
      // Обрабатываем оба формата ответа: с data и без
      const historyData = response.data.data || response.data;
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put('/notifications/settings', settings);

      if (response.status === 200) {
        message.success('Настройки успешно сохранены!');
      } else {
        message.error('Ошибка при сохранении настроек');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      message.error('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    if (!testOrderId) {
      message.error('Введите ID заказа для теста');
      return;
    }

    setTestLoading(true);
    try {
      const response = await axiosInstance.post('/notifications/test', {
        orderId: parseInt(testOrderId),
        type: testType,
      });

      if (response.status === 200) {
        message.success('Тестовое уведомление отправлено!');
        loadHistory(); // Обновляем историю

        // Показываем подробное уведомление об успехе
        setTimeout(() => {
          message.info(
            `✅ Тестовое уведомление успешно отправлено\nТип: ${getNotificationTypeLabel(
              testType,
            )}\nЗаказ ID: ${testOrderId}\nВремя: ${new Date().toLocaleString('ru-RU')}`,
            5,
          );
        }, 100);
      } else {
        message.error(`Ошибка: ${response.data.error}`);
      }
    } catch (error: any) {
      console.error('Ошибка отправки теста:', error);
      const errorMessage =
        error.response?.data?.message || 'Ошибка при отправке тестового уведомления';
      message.error(errorMessage);

      // Показываем подробное уведомление об ошибке
      setTimeout(() => {
        message.error(
          `❌ Ошибка отправки тестового уведомления\n` +
            `Причина: ${errorMessage}\n` +
            `Проверьте настройки и попробуйте снова`,
          5,
        );
      }, 100);
    } finally {
      setTestLoading(false);
    }
  };

  const runStaleOrdersCheck = async () => {
    try {
      const response = await axiosInstance.post('/notifications/check-stale-orders');

      if (response.status === 200) {
        message.success('Проверка зависших заказов запущена!');
        loadHistory();
      } else {
        message.error('Ошибка при запуске проверки');
      }
    } catch (error) {
      console.error('Ошибка проверки:', error);
      message.error('Ошибка при запуске проверки');
    }
  };

  const runDeadlinesCheck = async () => {
    try {
      const response = await axiosInstance.post('/notifications/check-deadlines');

      if (response.status === 200) {
        message.success('Проверка дедлайнов запущена!');
        loadHistory();
      } else {
        message.error('Ошибка при запуске проверки');
      }
    } catch (error) {
      console.error('Ошибка проверки:', error);
      message.error('Ошибка при запуске проверки');
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getNotificationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      new_order: 'Новый заказ',
      stale_order: 'Зависший заказ',
      deadline: 'Дедлайн',
    };
    return types[type] || type;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <MailOutlined />;
      case 'telegram':
        return <NotificationOutlined />;
      case 'push':
        return <NotificationOutlined />;
      default:
        return <NotificationOutlined />;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div
          style={{
            padding: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <Spin size="large">Загрузка...</Spin>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Настройки уведомлений */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NotificationOutlined />
              <Text>Настройки уведомлений</Text>
            </div>
          }
          className={styles.section}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Уведомления в email</label>
              <Switch
                checked={settings.email}
                onChange={(checked) => handleSettingChange('email', checked)}
              />

              {settings.email && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginLeft: 24,
                  }}
                >
                  <Text>Получатели email (через запятую):</Text>
                  <Input
                    value={settings.emailRecipients || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSettingChange('emailRecipients', e.target.value)
                    }
                    placeholder="email1@example.com, email2@example.com"
                    className={styles.textInput}
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="telegram">Уведomления в Telegram</label>
              <Switch
                checked={settings.telegram}
                onChange={(checked) => handleSettingChange('telegram', checked)}
              />

              {settings.telegram && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginLeft: 24,
                  }}
                >
                  <Text>Токен бота Telegram:</Text>
                  <Input
                    value={settings.telegramBotToken || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSettingChange('telegramBotToken', e.target.value)
                    }
                    placeholder="123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                    className={styles.textInput}
                  />

                  <Text>ID чата Telegram:</Text>
                  <Input
                    value={settings.telegramChatId || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSettingChange('telegramChatId', e.target.value)
                    }
                    placeholder="-1001234567890"
                    className={styles.textInput}
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newOrders">Новые заказы</label>
              <Switch
                checked={settings.newOrders}
                onChange={(checked) => handleSettingChange('newOrders', checked)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="staleOrders">Зависшие заказы</label>
              <Switch
                checked={settings.staleOrders}
                onChange={(checked) => handleSettingChange('staleOrders', checked)}
              />

              {settings.staleOrders && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginLeft: 24,
                  }}
                >
                  <Text>Часы для зависших заказов:</Text>
                  <Input
                    type="number"
                    value={settings.staleOrderHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSettingChange('staleOrderHours', parseInt(e.target.value))
                    }
                    min="1"
                    max="168"
                    className={styles.numberInput}
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="deadlineReminders">Дедлайны</label>
              <Switch
                checked={settings.deadlineReminders}
                onChange={(checked) => handleSettingChange('deadlineReminders', checked)}
              />
            </div>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveSettings}
              loading={saving}
              className={styles.saveButton}
            >
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </div>
        </Card>

        {/* Тестирование уведомлений */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SendOutlined />
              <Text>Тестирование уведомлений</Text>
            </div>
          }
          className={styles.section}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minWidth: 120,
                }}
              >
                <Text>ID заказа для теста:</Text>
                <Input
                  type="number"
                  value={testOrderId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTestOrderId(e.target.value)
                  }
                  placeholder="123"
                  className={styles.numberInput}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minWidth: 150,
                }}
              >
                <Text>Тип уведомления:</Text>
                <Select
                  value={testType}
                  onChange={setTestType}
                  className={styles.select}
                  popupClassName={styles.selectDropdown}
                  style={{
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <Option value="new_order">Новый заказ</Option>
                  <Option value="stale_order">Зависший заказ</Option>
                  <Option value="deadline">Дедлайн</Option>
                </Select>
              </div>
            </div>

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendTestNotification}
              disabled={!testOrderId}
              loading={testLoading}
              className={styles.testButton}
            >
              Отправить тестовое уведомление
            </Button>

            <div className={styles.buttonGroup}>
              <Button
                icon={<ClockCircleOutlined />}
                onClick={runStaleOrdersCheck}
                className={styles.actionButton}
              >
                Проверить зависшие заказы
              </Button>
              <Button
                icon={<ClockCircleOutlined />}
                onClick={runDeadlinesCheck}
                className={styles.actionButton}
              >
                Проверить дедлайны
              </Button>
            </div>
          </div>
        </Card>

        {/* История уведомлений */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NotificationOutlined />
              <Text>История уведомлений</Text>
            </div>
          }
          className={styles.section}
        >
          {history && history.length > 0 ? (
            <div className={styles.history}>
              <List
                dataSource={Array.isArray(history) ? history : [history]}
                renderItem={(item: NotificationHistory) => (
                  <List.Item
                    key={item.id}
                    className={`${styles.historyItem} ${
                      item.success ? styles.success : styles.error
                    }`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                        }}
                      >
                        {item.success ? (
                          <CheckCircleOutlined
                            style={{ color: '#52c41a', fontSize: 20 }}
                          />
                        ) : (
                          <CloseCircleOutlined
                            style={{ color: '#ff4d4f', fontSize: 20 }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className={styles.historyHeader}>
                          <Tag color={item.success ? 'green' : 'red'}>
                            {getNotificationTypeLabel(item.type)}
                          </Tag>
                          <Tag icon={getMethodIcon(item.method)}>{item.method}</Tag>
                          <Text type="secondary" className={styles.historyDate}>
                            {new Date(item.createdAt).toLocaleString('ru-RU')}
                          </Text>
                        </div>

                        <div className={styles.historyDetails}>
                          <div>
                            <strong>Заказ:</strong> #{item.orderId}
                          </div>
                          {item.recipient && (
                            <div>
                              <strong>Получатель:</strong> {item.recipient}
                            </div>
                          )}
                          {item.message && (
                            <div
                              style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                color: '#cbd5e1',
                                border: '1px solid #64748b',
                                borderRadius: 4,
                                padding: 8,
                                marginTop: 8,
                              }}
                            >
                              <Text>{item.message}</Text>
                            </div>
                          )}
                          {!item.success && item.error && (
                            <div className={styles.errorText}>
                              <Text>Ошибка: {item.error}</Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <Text style={{ color: '#64748b', textAlign: 'center', display: 'block' }}>
              Нет записей в истории
            </Text>
          )}
        </Card>
      </div>
    </div>
  );
}
