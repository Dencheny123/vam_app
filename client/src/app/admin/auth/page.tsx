'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { useRouter } from 'next/navigation';
import { signUpThunk, verifySignUp2FAThunk } from '@/entities/user/api/userThunkApi';

// Импорты из antd для v5 по отдельным модулям:
import Button from 'antd/es/button';
import Form, { FormProps } from 'antd/es/form';
import Input from 'antd/es/input';
import Card from 'antd/es/card';
import message from 'antd/es/message';
import Space from 'antd/es/space';
import Layout from 'antd/es/layout';
import Typography from 'antd/es/typography';

const { Content } = Layout;
const { Text } = Typography;

type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TwoFAFormValues = {
  code: string;
};

export default function SignUpForm() {
  const dispatch = useAppDispatch();
  const { twoFAPending, error, twoFAUserId } = useAppSelector((state) => state.user);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [signUpForm] = Form.useForm<SignUpFormValues>();
  const [twoFAForm] = Form.useForm<TwoFAFormValues>();

  useEffect(() => {
    setIsReady(true);
  }, []);

  const onSignUpSubmit: FormProps<SignUpFormValues>['onFinish'] = async (values) => {
    try {
      await dispatch(signUpThunk(values)).unwrap();
      signUpForm.resetFields();
    } catch (err) {
      message.error('Ошибка регистрации');
      console.error('Ошибка регистрации:', err);
    }
  };

  const onTwoFASubmit: FormProps<TwoFAFormValues>['onFinish'] = async (values) => {
    if (!twoFAUserId) {
      message.error('Не найден ID пользователя');
      return;
    }
    try {
      await dispatch(verifySignUp2FAThunk({ userId: twoFAUserId, code: values.code })).unwrap();
      twoFAForm.resetFields();
      router.push('/');
    } catch (err) {
      message.error('Ошибка подтверждения 2FA');
      console.error('Ошибка 2FA:', err);
    }
  };

  if (!isReady) return null;

  return (
    <Layout style={{ background: 'transparent' }}>
      <Content
        style={{
          width: '80%',
          margin: '120px auto',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Card
          title={<Text style={{ color: '#69b1ff', fontSize: 18 }}>Регистрация</Text>}
          style={{
            background: 'transparent',
            padding: 16,
            borderRadius: 8,
            color: '#69b1ff',
          }}
        >
          {twoFAPending ? (
            <Form form={twoFAForm} layout="vertical" onFinish={onTwoFASubmit}>
              <Form.Item
                label={<Text style={{ color: '#69b1ff' }}>Код 2FA</Text>}
                name="code"
                rules={[
                  { required: true, message: 'Пожалуйста, введите код 2FA!' },
                  {
                    pattern: /^[0-9]{6}$/,
                    message: 'Код 2FA должен состоять ровно из 6 цифр',
                  },
                ]}
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
                <Button type="text" htmlType="submit" style={{ color: '#69b1ff', padding: 0 }}>
                  Подтвердить
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form form={signUpForm} layout="vertical" onFinish={onSignUpSubmit}>
              <Form.Item
                label={<Text style={{ color: '#69b1ff' }}>Имя</Text>}
                name="name"
                rules={[{ required: true, message: 'Имя обязательно' }]}
              >
                <Input
                  placeholder="Имя"
                  style={{
                    background: '#334155',
                    color: '#69b1ff',
                    border: '1px solid #64748b',
                    borderRadius: 4,
                  }}
                />
              </Form.Item>
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
              <Form.Item
                label={<Text style={{ color: '#69b1ff' }}>Повторите пароль</Text>}
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Подтверждение пароля обязательно' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Пароли не совпадают'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Повторите пароль"
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
                  <Button type="text" htmlType="submit" style={{ color: '#69b1ff', padding: 0 }}>
                    Зарегистрироваться
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
