'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import SearchFilter from '../../components/SearchFilter';
import {
  Button,
  Modal,
  Upload,
  Spin,
  Form,
  Input,
  message,
  Space,
  Card,
  Image,
  List,
  Typography,
  Layout,
} from 'antd/es';
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from '@/entities/service/api/serviceThunkApi';
import { clearCurrentService } from '@/entities/service/slice/serviceSlice';
import { Service } from '@/entities/service/model/serviceTypes';

const { Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const ServiceManager = () => {
  const dispatch = useAppDispatch();
  const { services, currentService, loading, error } = useAppSelector(
    (state) => state.service,
  );
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredServices, setFilteredServices] = useState(services);
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 1;

  useEffect(() => {
    dispatch(getAllServices());
  }, [dispatch]);

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter((service) =>
      ['service', 'description'].some((field) => {
        const value = service[field as keyof typeof service];
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        if (Array.isArray(value)) {
          return value.some((v: any) =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
    
    setFilteredServices(filtered);
  }, [services, searchTerm]);
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
    if (currentService && editMode) {
      let parsedDescriptions: string[] = [];

      try {
        const description = currentService.description;
        if (description !== undefined) {
          parsedDescriptions = JSON.parse(description);
          if (!Array.isArray(parsedDescriptions)) {
            parsedDescriptions = [description];
          }
        } else {
          parsedDescriptions = [];
        }
      } catch {
        parsedDescriptions = [currentService.description || ''];
      }

      form.setFieldsValue({
        service: currentService.service,
        description: parsedDescriptions,
      });

      if (currentService.image) {
        setFileList([
          {
            uid: '-1',
            name: 'current-image',
            status: 'done',
            url: currentService.image,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [currentService, editMode, form]);

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditMode(false);
    dispatch(clearCurrentService());
    form.resetFields();
    setFileList([]);
  };

  const handleCreate = () => {
    setEditMode(false);
    dispatch(clearCurrentService());
    showModal();
  };

  const handleEdit = (id: number) => {
    dispatch(getServiceById(id));
    setEditMode(true);
    showModal();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await dispatch(deleteService(deleteId)).unwrap();
        message.success('Услуга удалена');
        setIsDeleteModalVisible(false);
        dispatch(getAllServices());
      } catch (err) {
        message.error('Ошибка при удалении');
        console.error('Ошибка при удалении:', err);
        setIsDeleteModalVisible(false);
      }
    }
  };

  const onFinish = async (
    values: Omit<Service, 'id' | 'images' | 'createdAt' | 'updatedAt'>,
  ) => {
    const formData = new FormData();

    if (Array.isArray(values.description)) {
      formData.append('description', JSON.stringify(values.description));
    } else {
      formData.append('description', values.description || '');
    }

    formData.append('service', values.service || '');

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('images', fileList[0].originFileObj);
    }

    try {
      if (editMode && currentService) {
        await dispatch(updateService({ id: currentService.id, formData })).unwrap();
        message.success('Услуга обновлена');
      } else {
        await dispatch(createService(formData)).unwrap();
        message.success('Услуга создана');
      }
      handleCancel();
      dispatch(getAllServices());
    } catch (err) {
      message.error('Ошибка при сохранении');
      console.error('Ошибка:', err);
    }
  };

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: RcFile) => {
      setFileList([
        {
          uid: Math.random().toString(36).substring(2),
          name: file.name,
          status: 'done',
          originFileObj: file,
        },
      ]);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Layout style={{ minWidth: '80vw', background: 'transparent' }}>
      <Content
        style={{
          width: '100%',
          margin,
          background: 'transparent',
          height: 'auto',
          padding: 8,
          borderRadius: 8,
        }}
      >
        <Card
          title={
            <Text style={{ color: '#69b1ff', fontSize: 18 }}>Управление услугами</Text>
          }
          extra={
            <Button
              type="text"
              icon={<PlusOutlined style={{ color: '#69b1ff' }} />}
              onClick={handleCreate}
              style={{ color: '#69b1ff', padding: 0 }}
            >
              Добавить услугу
            </Button>
          }
          style={{
            background: 'transparent',
            padding: 8,
            borderRadius: 8,
            color: '#69b1ff',
          }}
          styles={{ body: { padding: 18 } }}
        >
          <Spin spinning={loading}>
            {services.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <SearchFilter
                  placeholder="Поиск по названию услуги или описанию..."
                  onSearchChange={setSearchTerm}
                />
              </div>
            )}
            {paginatedServices.map((service) => {
              let descriptionItems: string[] = [];
              try {
                descriptionItems = JSON.parse(service.description || '[]');
                if (!Array.isArray(descriptionItems)) {
                  descriptionItems = [service.description || ''];
                }
              } catch {
                descriptionItems = [service.description || ''];
              }

              return (
                <Card
                  key={service.id}
                  style={{
                    background: 'transparent',
                    border: '2px solid #64748b',
                    borderRadius: 12,
                  }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: '#69b1ff' }} />}
                      onClick={() => handleEdit(service.id)}
                      style={{ color: '#69b1ff', padding: 0 }}
                    />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ color: '#fd9b9b' }} />}
                      onClick={() => handleDelete(service.id)}
                      style={{ color: '#fd9b9b', padding: 0 }}
                    />,
                  ]}
                  styles={{ actions: { background: 'transparent' } }}
                >
                  <Card.Meta
                    title={
                      <Text
                        style={{ color: '#69b1ff', fontSize: 20, fontWeight: 'bold' }}
                      >
                        Услуга #{service.id}
                      </Text>
                    }
                    description={
                      <div style={{ padding: 0 }}>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Название:
                          </Text>
                          <div
                            style={{
                              background: '#1e293b',
                              padding: 8,
                              borderRadius: 6,
                              marginTop: 4,
                              color: '#a3bffa',
                              minHeight: 20,
                            }}
                          >
                            {service.service || '-'}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Описание:
                          </Text>
                          <div
                            style={{
                              background: '#1e293b',
                              padding: 8,
                              borderRadius: 6,
                              marginTop: 4,
                              color: '#a3bffa',
                              minHeight: 20,
                            }}
                          >
                            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                              {descriptionItems.map((item, index) => (
                                <li
                                  key={index}
                                  style={{
                                    position: 'relative',
                                    paddingLeft: '22px',
                                    marginBottom: '8px',
                                    color: 'var(--text-color)',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  <span
                                    style={{
                                      position: 'absolute',
                                      left: '0',
                                      color: 'var(--secondary-color)',
                                      fontSize: '0.9rem',
                                      top: '2px',
                                    }}
                                  >
                                    ✔
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {service.image && (
                          <div style={{ marginBottom: 12 }}>
                            <Image
                              src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${service.image}`}
                              alt={`Изображение услуги: ${service.service}`}
                              style={{
                                maxWidth: '100%',
                                maxHeight: 300,
                                marginTop: 4,
                                borderRadius: 6,
                              }}
                              preview={{
                                src: `${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${service.image}`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              );
            })}
          </Spin>

          {filteredServices.length > pageSize && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="text"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ color: '#69b1ff', padding: 0, marginRight: 8 }}
              >
                Предыдущая
              </Button>
              <Text style={{ color: '#69b1ff', margin: '0 16px' }}>
                Страница {currentPage} из {Math.ceil(filteredServices.length / pageSize)}
              </Text>
              <Button
                type="text"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(services.length / pageSize)),
                  )
                }
                disabled={currentPage === Math.ceil(filteredServices.length / pageSize)}
                style={{ color: '#69b1ff', padding: 0, marginLeft: 8 }}
              >
                Следующая
              </Button>
            </div>
          )}

          <Modal
            title={
              <Text style={{ color: '#69b1ff', fontSize: 18, fontWeight: 'bold' }}>
                {editMode
                  ? 'Редактировать услугу'
                  : currentService
                  ? `${currentService.service}`
                  : 'Добавить услугу'}
              </Text>
            }
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            styles={{
              content: {
                background:
                  'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
                borderRadius: 8,
              },
              body: {
                padding: 16,
                background: 'transparent',
                color: '#69b1ff',
              },
              header: {
                background: 'transparent',
              },
            }}
          >
            {!editMode && currentService ? (
              <div
                style={{
                  lineHeight: 1.8,
                  color: '#69b1ff',
                  display: 'flex',
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                {currentService.image && (
                  <div style={{ marginTop: 12, flex: '0 0 40%' }}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${currentService.image}`}
                      alt="Превью"
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                      preview={{
                        src: `${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${currentService.image}`,
                      }}
                    />
                  </div>
                )}
                <div style={{ marginLeft: '12%', flex: 1 }}>
                  <div>
                    <Text style={{ color: '#69b1ff' }}>
                      <b>Описание:</b>
                    </Text>
                    <List
                      size="small"
                      dataSource={(() => {
                        try {
                          const parsed = JSON.parse(currentService.description || '[]');
                          return Array.isArray(parsed)
                            ? parsed
                            : [currentService.description];
                        } catch {
                          return [currentService.description];
                        }
                      })()}
                      renderItem={(item: string) => (
                        <List.Item
                          style={{ color: '#69b1ff', borderBottom: '1px solid #64748b' }}
                        >
                          {item}
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  service: '',
                  description: [''],
                }}
                style={{
                  color: '#69b1ff',
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Название услуги</Text>}
                  name="service"
                  rules={[{ required: true, message: 'Введите название услуги' }]}
                >
                  <Input
                    style={{
                      background: '#334155',
                      color: '#69b1ff',
                      border: '1px solid #64748b',
                      borderRadius: 4,
                    }}
                  />
                </Form.Item>

                <Form.List name="description">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Form.Item
                          key={key}
                          label={
                            <Text style={{ color: '#69b1ff' }}>{`Описание ${
                              name + 1
                            }`}</Text>
                          }
                          {...restField}
                          name={name}
                        >
                          <TextArea
                            style={{
                              background: '#334155',
                              color: '#69b1ff',
                              border: '1px solid #64748b',
                              borderRadius: 4,
                            }}
                          />
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button
                          type="text"
                          onClick={() => add()}
                          icon={<PlusOutlined style={{ color: '#69b1ff' }} />}
                          style={{ color: '#69b1ff', padding: 0 }}
                        >
                          Добавить описание
                        </Button>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            onClick={() => remove(fields.length - 1)}
                            icon={<MinusOutlined style={{ color: '#fd9b9b' }} />}
                            style={{ color: '#fd9b9b', padding: 0, marginLeft: 8 }}
                          >
                            Удалить описание
                          </Button>
                        )}
                      </Form.Item>
                    </>
                  )}
                </Form.List>

                <Form.Item label={<Text style={{ color: '#69b1ff' }}>Изображение</Text>}>
                  <Upload {...uploadProps}>
                    <Button
                      type="text"
                      icon={<UploadOutlined style={{ color: '#69b1ff' }} />}
                      style={{ color: '#69b1ff', padding: 0 }}
                    >
                      Выбрать файл
                    </Button>
                  </Upload>
                  {currentService?.image && !fileList.length && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${currentService.image}`}
                      alt="Изображение"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        marginTop: 12,
                        borderRadius: 8,
                      }}
                      preview={{
                        src: `${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${currentService.image}`,
                      }}
                    />
                  )}
                </Form.Item>

                <Form.Item>
                  <Button
                    type="text"
                    htmlType="submit"
                    loading={loading}
                    style={{ color: '#69b1ff', padding: 0 }}
                  >
                    {editMode ? 'Обновить' : 'Создать'}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Modal>

          <Modal
            open={isDeleteModalVisible}
            onCancel={() => setIsDeleteModalVisible(false)}
            onOk={confirmDelete}
            okText="Удалить"
            cancelText="Отмена"
            title={
              <Text style={{ color: '#69b1ff' }}>
                Вы уверены, что хотите удалить услугу?
              </Text>
            }
            styles={{
              content: {
                background:
                  'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
                borderRadius: 8,
                padding: 16,
              },
              body: {
                background: 'transparent',
                color: '#69b1ff',
              },
              header: {
                background: 'transparent',
              },
            }}
            okButtonProps={{
              style: {
                color: '#fd9b9b',
                borderColor: '#fd9b9b',
                background: 'transparent',
              },
            }}
            cancelButtonProps={{
              style: {
                color: '#69b1ff',
                borderColor: '#69b1ff',
                background: 'transparent',
              },
            }}
          >
            <Text style={{ color: '#69b1ff' }}>Это действие нельзя отменить.</Text>
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

export default ServiceManager;
