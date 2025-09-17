'use client';

import { useState } from 'react';
import { Button, Modal, Form, Input, Checkbox, message, theme } from 'antd/es';
import {
  PhoneOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { sendRecordingThunk } from '@/entities/recording/api/RecordingFormApi';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
const { TextArea } = Input;

export const Feedback = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const { token } = theme.useToken();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await dispatch(
        sendRecordingThunk({
          name: 'Форма обратной связи',
          tel: values.phone,
          message: `Предпочтительное время звонка: ${
            values.time ? 'с 9:00 до 20:00' : 'не указано'
          }. Дни: ${values.weekdays ? 'Не беспокоить в выходные' : 'не указаны'}`,
          personalData: 'true',
          oferta: 'true',
        }),
      ).unwrap();

      message.success('Спасибо за заявку! Мы свяжемся с вами в указанное время');
      setModalSuccess(true);
      setModalVisible(true);
      form.resetFields();
      setTimeout(() => {
        setOpen(false);
        setModalVisible(false);
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      message.error('Ошибка при отправке формы. Пожалуйста, попробуйте позже.');
      setModalSuccess(false);
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 3000);
      console.error('Ошибка отправки формы:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setOpen(!open);
    if (!open) {
      form.resetFields();
      setSubmitted(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={toggleModal}
        style={{
          position: 'fixed',
          right: '40px',
          bottom: '50%',
          zIndex: 100,
          transform: 'rotate(90deg)',
          transformOrigin: 'right bottom',
          backgroundColor: 'var(--accent)',
          color: 'white',
          padding: '0 24px',
          height: '40px',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0 0 8px 8px',
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          overflow: 'hidden',
          boxShadow: '0 2px 4px var(--shadow)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(90deg) translateY(20px)';
          e.currentTarget.style.height = '60px';
          e.currentTarget.style.boxShadow = '0 0 10px var(--shadow)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(90deg)';
          e.currentTarget.style.height = '40px';
          e.currentTarget.style.boxShadow = '0 2px 4px var(--shadow)';
        }}
      >
        Оставить заявку
      </Button>

      <Modal
        title="Оставьте заявку на звонок"
        open={open}
        onCancel={toggleModal}
        footer={null}
        closeIcon={<CloseOutlined style={{ color: 'var(--bg-primary)', fontSize: '16px' }} />}
        width={400}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
        }}
        styles={{
          body: {
            background: 'transparent',
            padding: '24px',
          },
          header: {
            background: 'transparent',
            borderBottom: `1px solid var(--accent)`,
            padding: '16px 24px',
            color: 'var(--text-primary)',
            fontWeight: 600,
          },
          content: {
            background: 'var(--bg-primary)'
          }
        }}
      >
        {submitted ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'var(--text-primary)',
            }}
          >
            <p style={{ fontSize: '16px', color: 'var(--accent)' }}>Спасибо за заявку!</p>
            <p>Мы свяжемся с вами в указанное время</p>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ weekdays: false, time: false }}
            style={{ maxWidth: '100%' }}
          >
            <Form.Item
              name="weekdays"
              valuePropName="checked"
              style={{ marginBottom: '16px' }}
            >
              <Checkbox style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Не беспокоить в выходные дни
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="time"
              valuePropName="checked"
              style={{ marginBottom: '16px' }}
            >
              <Checkbox style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                с 9:00 до 20:00
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Пожалуйста, введите ваш телефон' },
                {
                  pattern: /^\+?[0-9\s\-\(\)]+$/,
                  message: 'Пожалуйста, введите корректный номер телефона',
                },
              ]}
              style={{ marginBottom: '16px' }}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: 'var(--accent)' }} />}
                placeholder="+7 (___) ___-__-__"
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)')}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '40px',
                  background: 'var(--accent)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px var(--shadow)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px var(--shadow)';
                }}
              >
                Заказать звонок
              </Button>
            </Form.Item>

            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                opacity: 0.7,
                marginTop: '0.5rem',
              }}
            >
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>

            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
                color: 'var(--accent)',
                fontWeight: 500,
              }}
            >
              <span>ВентСтройМонтаж</span>
            </div>
          </Form>
        )}
      </Modal>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        closable={false}
        width={350}
        style={{
          borderRadius: '12px',
        }}
        styles={{
          body: {
            padding: '24px',
            textAlign: 'center',
            background: 'transparent',
          },
          content: {
            background: 'var(--bg-primary)'
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {modalSuccess ? (
            <>
              <CheckCircleOutlined
                style={{ fontSize: '2.5rem', color: 'var(--accent)' }}
              />
              <p
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Заявка успешно отправлена!
              </p>
              <p
                style={{ fontSize: '0.9rem', color: 'var(--text-primary)', opacity: 0.8 }}
              >
                Мы свяжемся с вами скоро.
              </p>
            </>
          ) : (
            <>
              <ExclamationCircleOutlined
                style={{ fontSize: '2.5rem', color: '#dc2626' }}
              />
              <p
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Ошибка отправки
              </p>
              <p
                style={{ fontSize: '0.9rem', color: 'var(--text-primary)', opacity: 0.8 }}
              >
                Пожалуйста, попробуйте позже.
              </p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
