'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { useRouter } from 'next/navigation';
import {
  signInThunk,
  signOutThunk,
  verifySignIn2FAForAdminThunk,
} from '@/entities/user/api/userThunkApi';
import { Button, Form, Input, Layout, Typography, Space, Card, message } from 'antd/es';
import type { FormProps } from 'antd/es';

const { Content } = Layout;
const { Text } = Typography;

type SignInFormValues = {
  email: string;
  password: string;
};

type TwoFAFormValues = {
  code: string;
};

export default function SignInForm() {
  const dispatch = useAppDispatch();
  const { twoFAPending, twoFAUserId, error, isInitialized } = useAppSelector(
    (state) => state.user,
  );
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [signInForm] = Form.useForm<SignInFormValues>();
  const [twoFAForm] = Form.useForm<TwoFAFormValues>();

  useEffect(() => {
    setIsReady(true);
  }, []);

  const onSignInSubmit: FormProps<SignInFormValues>['onFinish'] = async (values) => {
    try {
      await dispatch(signInThunk(values)).unwrap();
      signInForm.resetFields();
    } catch (err) {
      message.error('Ошибка входа');
      console.error('Ошибка входа:', err);
    }
  };

  const onTwoFASubmit: FormProps<TwoFAFormValues>['onFinish'] = async (values) => {
    if (!twoFAUserId) {
      message.error('Не найден ID пользователя');
      return;
    }
    try {
      await dispatch(
        verifySignIn2FAForAdminThunk({ userId: twoFAUserId, code: values.code }),
      ).unwrap();
      twoFAForm.resetFields();
      router.push('/admin/menu');
    } catch (err) {
      message.error('Ошибка подтверждения 2FA');
      console.error('Ошибка 2FA:', err);
    }
  };

  const onSignOut = async () => {
    try {
      await dispatch(signOutThunk()).unwrap();
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  return (
    <Layout style={{ background: 'transparent' }}>
      <Content
        style={{
          width: '80%',
          margin: '120px auto',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
          height: 'auto',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Card
          title={<Text style={{ color: '#69b1ff', fontSize: 18 }}>Вход</Text>}
          style={{
            background: 'transparent',
            padding: 16,
            borderRadius: 8,
            color: '#69b1ff',
          }}
          styles={{ body: { padding: 16 } }}
        >
          {twoFAPending ? (
            <Form
              form={twoFAForm}
              layout="vertical"
              onFinish={onTwoFASubmit}
              style={{
                color: '#69b1ff',
                background: 'transparent',
                padding: 16,
                borderRadius: 8,
              }}
            >
              <Form.Item
                label={<Text style={{ color: '#69b1ff' }}>Код 2FA</Text>}
                name="code"
                rules={[{ required: true, message: 'Код 2FA обязателен' }]}
              >
                <Input
                  placeholder="Введите код 2FA"
                  style={{
                    background: '#334155',
                    color: '#69b1ff',
                    border: '1px solid #64748b',
                    borderRadius: 4,
                  }}
                />
              </Form.Item>
              {error && (
                <Form.Item>
                  <Text style={{ color: '#fd9b9b' }}>{error}</Text>
                </Form.Item>
              )}
              <Form.Item>
                <Button
                  type="text"
                  htmlType="submit"
                  style={{ color: '#69b1ff', padding: 0 }}
                >
                  Подтвердить
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form
              form={signInForm}
              layout="vertical"
              onFinish={onSignInSubmit}
              style={{
                color: '#69b1ff',
                background: 'transparent',
                padding: 16,
                borderRadius: 8,
              }}
            >
              <Form.Item
                label={<Text style={{ color: '#69b1ff' }}>Email</Text>}
                name="email"
                rules={[
                  { required: true, message: 'Email обязателен' },
                  { type: 'email', message: 'Некорректный email' },
                ]}
              >
                <Input
                  type="email"
                  placeholder="Email"
                  style={{
                    background: '#334155',
                    color: '#69b1ff',
                    border: '1px solid #64748b',
                    borderRadius: 4,
                  }}
                />
              </Form.Item>
              <Form.Item
                label={<Text style={{ color: '#69b1ff' }}>Пароль</Text>}
                name="password"
                rules={[
                  { required: true, message: 'Пароль обязателен' },
                  { min: 6, message: 'Пароль должен содержать минимум 6 символов' },
                ]}
              >
                <Input.Password
                  placeholder="Пароль"
                  style={{
                    background: '#334155',
                    color: '#69b1ff',
                    border: '1px solid #64748b',
                    borderRadius: 4,
                  }}
                />
              </Form.Item>
              {error && (
                <Form.Item>
                  <Text style={{ color: '#fd9b9b' }}>{error}</Text>
                </Form.Item>
              )}
              <Form.Item>
                <Space>
                  <Button
                    type="text"
                    htmlType="submit"
                    style={{ color: '#69b1ff', padding: 0 }}
                  >
                    Войти
                  </Button>
                  <Button
                    type="text"
                    onClick={onSignOut}
                    style={{ color: '#fd9b9b', padding: 0 }}
                  >
                    Выход
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Content>
    </Layout>
  );
}