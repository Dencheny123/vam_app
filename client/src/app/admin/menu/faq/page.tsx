'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import {
  fetchFaqs,
  deleteFaq,
  updateFaq,
  createFaq,
} from '@/entities/FAQ/api/faqThunkApi';
import { Faq } from '@/entities/FAQ/model/faqTypes';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { faqSchema } from './faqSchema';
import { z } from 'zod';
import {
  Button,
  Form,
  Input,
  Layout,
  Typography,
  Space,
  Collapse,
  Spin,
  Modal,
  message,
  Card,
} from 'antd/es';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller } from 'react-hook-form';

const { Content } = Layout;
const { Text, Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

type FaqFormValues = z.infer<typeof faqSchema>;

const FaqManagementPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: faqs, status, error } = useAppSelector((state) => state.faq);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const form = useForm<{ question: string; answers: string }>();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (error) {
      message.error(error);
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [error]);

    const margin = windowWidth < 765 ? '60px auto' : '0px auto';

  useEffect(() => {
    if (editingFaq) {
      reset({
        question: editingFaq.question || '',
        answers: editingFaq.answers || '',
      });
    } else {
      reset({
        question: '',
        answers: '',
      });
    }
  }, [editingFaq, reset]);

  const onSubmit: SubmitHandler<FaqFormValues> = async (data) => {
    try {
      if (isCreateMode) {
        await dispatch(createFaq(data)).unwrap();
        message.success('Вопрос создан');
      } else if (editingFaq) {
        await dispatch(
          updateFaq({
            id: editingFaq.id,
            ...data,
          }),
        ).unwrap();
        message.success('Вопрос обновлён');
      }
      setIsModalVisible(false);
      setEditingFaq(null);
      setIsCreateMode(false);
      reset();
      dispatch(fetchFaqs());
    } catch (error) {
      message.error('Ошибка при сохранении');
      console.error('Ошибка:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteFaq(id)).unwrap();
      message.success('Вопрос удалён');
      dispatch(fetchFaqs());
    } catch (error) {
      message.error('Ошибка при удалении');
      console.error('Ошибка при удалении:', error);
    }
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setIsCreateMode(false);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingFaq(null);
    setIsCreateMode(true);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingFaq(null);
    setIsCreateMode(false);
    reset();
  };

  if (status === 'loading') {
    return (
      <Layout style={{ minWidth: '80vw', background: 'transparent' }}>
        <Content
          style={{
            width: '100%',
            margin,
            background:
              'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
            padding: 16,
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ background: 'transparent', minWidth: '80vw' }}>
      <Content
        style={{
          width: '100%',
          margin: '60px auto',
          height: 'auto',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Card
          title={
            <Text style={{ color: '#69b1ff', fontSize: 18, fontWeight: 'bold' }}>
              Управление вопросами
            </Text>
          }
          extra={
            <Button
              type="text"
              icon={<PlusOutlined style={{ color: '#69b1ff' }} />}
              onClick={handleCreate}
              style={{ color: '#69b1ff', padding: 0 }}
            >
              Добавить вопрос
            </Button>
          }
          style={{
            background: 'transparent',
            padding: 16,
            borderRadius: 8,
            color: '#69b1ff',
          }}
          styles={{ body: { padding: 16 } }}
        >
          {/* className={styles.faqCollapse} */}
          <Collapse accordion>
            {faqs.map((faq) => (
              <Panel
                header={
                  <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                    {faq.question}
                  </Text>
                }
                key={faq.id}
                extra={
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: '#69b1ff' }} />}
                      onClick={() => handleEdit(faq)}
                      style={{ color: '#69b1ff', padding: 0 }}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ color: '#fd9b9b' }} />}
                      onClick={() => handleDelete(faq.id)}
                      style={{ color: '#fd9b9b', padding: 0 }}
                    />
                  </Space>
                }
                style={{
                  background: '#334155',
                  border: '1px solid #64748b',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#000' }}>{faq.answers}</Text>
              </Panel>
            ))}
          </Collapse>

          <Modal
            title={
              <Text style={{ color: '#69b1ff', fontSize: 18, fontWeight: 'bold' }}>
                {isCreateMode ? 'Добавить новый вопрос' : 'Редактирование вопроса'}
              </Text>
            }
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            style={{
              borderRadius: 8,
            }}
            styles={{
              body: {
                background: 'transparent',
              },
              content: {
                background:
                  'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
                borderRadius: 8,
              },
              header: {
                background: 'transparent',
                borderRadius: 8,
              },
            }}
          >
            <FormProvider {...form}>
              <Form
                {...form}
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                style={{
                  color: '#69b1ff',
                  background: 'transparent',
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Вопрос</Text>}
                  validateStatus={errors.question ? 'error' : ''}
                  help={errors.question?.message}
                >
                  <Controller
                    name="question"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Введите вопрос"
                        style={{
                          background: '#334155',
                          color: '#69b1ff',
                          border: '1px solid #64748b',
                          borderRadius: 4,
                        }}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Ответ</Text>}
                  validateStatus={errors.answers ? 'error' : ''}
                  help={errors.answers?.message}
                >
                  <Controller
                    name="answers"
                    control={form.control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        placeholder="Введите ответ"
                        rows={5}
                        style={{
                          background: '#334155',
                          color: '#69b1ff',
                          border: '1px solid #64748b',
                          borderRadius: 4,
                        }}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item>
                  <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="text"
                      onClick={handleCancel}
                      style={{ color: '#fd9b9b', padding: 0 }}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="text"
                      htmlType="submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      style={{ color: '#69b1ff', padding: 0 }}
                    >
                      {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </FormProvider>
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

export default FaqManagementPage;
