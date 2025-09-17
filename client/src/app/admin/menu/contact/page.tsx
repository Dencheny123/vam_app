'use client';

import React, { useEffect, useState } from 'react';
import SearchFilter from '../components/SearchFilter';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Layout,
  Card,
} from 'antd/es';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import {
  getAllContactsThunk,
  updateContactThunk,
  deleteContactThunk,
  createContactThunk,
} from '@/entities/contacts/api/ContactsApi';
import { ContactDataType, ContactType } from '@/entities/contacts/model';
import { Controller, useForm } from 'react-hook-form';

const { Text } = Typography;
const { Content } = Layout;
const { Meta } = Card;

const ContactsManager = () => {
  const dispatch = useAppDispatch();
  const { contacts, isLoading } = useAppSelector((state) => state.contacts);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactDataType>({
    defaultValues: {
      email: '',
      tel: '',
      address: '',
      whatsapp: '',
      telegram: '',
    },
  });
  const [form] = Form.useForm();
  const [editingContact, setEditingContact] = useState<ContactType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [filteredContacts, setFilteredContacts] = useState(contacts || []);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getAllContactsThunk());
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
  }, [dispatch]);
  const margin = windowWidth < 765 ? '60px auto' : '0px auto';

  useEffect(() => {
    if (!contacts) return;

    setFilteredContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    if (!contacts) return;

    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter((contact) =>
      ['email', 'tel', 'address', 'whatsapp', 'telegram'].some((field) => {
        const value = contact[field as keyof typeof contact];

        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }

        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }),
    );

    setFilteredContacts(filtered);
  }, [contacts, searchTerm]);

  useEffect(() => {
    if (editingContact) {
      reset({
        email: editingContact.email || '',
        tel: editingContact.tel || '',
        address: editingContact.address || '',
        whatsapp: editingContact.whatsapp || '',
        telegram: editingContact.telegram || '',
      });
      form.setFieldsValue({
        email: editingContact.email || '',
        tel: editingContact.tel || '',
        address: editingContact.address || '',
        whatsapp: editingContact.whatsapp || '',
        telegram: editingContact.telegram || '',
      });
    } else {
      reset({
        email: '',
        tel: '',
        address: '',
        whatsapp: '',
        telegram: '',
      });
      form.resetFields();
    }
  }, [editingContact, reset, form]);

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingContact(null);
    setIsModalVisible(true);
  };

  const handleEdit = (contact: ContactType) => {
    setEditingContact(contact);
    setIsCreating(false);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await dispatch(deleteContactThunk(id)).unwrap();
      if (result) {
        message.success('Контакт удален');
        dispatch(getAllContactsThunk());
      } else {
        throw new Error('Удаление не выполнено');
      }
    } catch (error) {
      message.error(`Ошибка при удалении контакта: ${error || 'Неизвестная ошибка'}`);
      console.error('Delete error:', error);
    }
  };

  const onSubmit = async (values: ContactDataType) => {
    console.log('Submitting values:', values);
    try {
      if (editingContact) {
        await dispatch(
          updateContactThunk({ id: editingContact.id, data: values }),
        ).unwrap();
        message.success('Контакт обновлен');
      } else {
        await dispatch(createContactThunk(values)).unwrap();
        message.success('Контакт создан');
      }
      setIsModalVisible(false);
      setEditingContact(null);
      setIsCreating(false);
      dispatch(getAllContactsThunk());
    } catch (error) {
      message.error(`Ошибка при сохранении контакта: ${error || 'Неизвестная ошибка'}`);
      console.error('Submit error:', error);
    }
  };

  const paginatedContacts = filteredContacts?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Layout style={{ maxWidth: '100vh', background: 'transparent' }}>
      <Content
        style={{
          width: '100%',
          margin,
          height: 'auto',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr', // Одна колонка для адаптивности
            gap: 24,
            justifyItems: 'center',
          }}
        >
          {paginatedContacts?.map((contact) => (
            <Card
              title={
                <Typography.Text
                  style={{ color: '#69b1ff', textAlign: 'center', fontSize: 20 }}
                >
                  Управление контактами
                </Typography.Text>
              }
              extra={
                <Button
                  type="text"
                  icon={<PlusOutlined style={{ color: '#69b1ff' }} />}
                  onClick={openCreateModal}
                  style={{
                    color: '#69b1ff',
                    padding: 0,
                    marginTop: 16,
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  {' '}
                  Добавить контакт
                </Button>
              }
              key={contact.id}
              style={{
                width: '100%',
                maxWidth: '100%',
                background: 'transparent',
                border: '2px solid #64748b',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
              }}
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined style={{ color: '#69b1ff' }} />}
                  onClick={() => handleEdit(contact)}
                  style={{ color: '#69b1ff', padding: 0 }}
                />,
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ color: '#fd9b9b' }} />}
                  onClick={() => handleDelete(contact.id)}
                  style={{ color: '#fd9b9b', padding: 0 }}
                />,
              ]}
              styles={{
                actions: {
                  background: 'transparent',
                  border: '2px solid #64748b',
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                },
              }}
            >
              {contacts && contacts.length > 0 && (
                <div style={{ marginBottom: 16, width: '100%', maxWidth: 300 }}>
                  <SearchFilter
                    placeholder="Поиск по email, телефону, адресу, WhatsApp или Telegram..."
                    onSearchChange={setSearchTerm}
                  />
                </div>
              )}
              <Meta
                title={
                  <Text style={{ color: '#69b1ff', fontSize: 20, fontWeight: 'bold' }}>
                    Контакт #{contact.id}
                  </Text>
                }
                description={
                  <div style={{ padding: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>Email:</Text>
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
                        {contact.email || '-'}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                        Телефон:
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
                        {contact.tel || '-'}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>Адрес:</Text>
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
                        {contact.address || '-'}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                        WhatsApp:
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
                        {contact.whatsapp || '-'}
                      </div>
                    </div>
                    <div>
                      <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                        Telegram:
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
                        {contact.telegram || '-'}
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>

        {filteredContacts && filteredContacts.length > pageSize && (
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
              Страница {currentPage} из {Math.ceil(filteredContacts.length / pageSize)}
            </Text>
            <Button
              type="text"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(filteredContacts.length / pageSize)),
                )
              }
              disabled={currentPage === Math.ceil(filteredContacts.length / pageSize)}
              style={{ color: '#69b1ff', padding: 0, marginLeft: 8 }}
            >
              Следующая
            </Button>
          </div>
        )}

        <Modal
          title={
            <Text style={{ color: '#69b1ff' }}>
              {isCreating ? 'Создать контакт' : 'Редактировать контакт'}
            </Text>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingContact(null);
            setIsCreating(false);
            reset();
            form.resetFields();
          }}
          onOk={handleSubmit(onSubmit)}
          okText="Сохранить"
          cancelText="Отмена"
          style={{ borderRadius: 8 }}
          styles={{
            content: {
              background:
                'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
            },
            header: { background: 'transparent' },
            body: { background: 'transparent' },
          }}
        >
          <Form
            form={form}
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
              label={<Text style={{ color: '#69b1ff' }}>Email</Text>}
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Введите email"
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
              label={<Text style={{ color: '#69b1ff' }}>Телефон</Text>}
              validateStatus={errors.tel ? 'error' : ''}
              help={errors.tel?.message}
            >
              <Controller
                name="tel"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Введите телефон"
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
              label={<Text style={{ color: '#69b1ff' }}>Адрес</Text>}
              validateStatus={errors.address ? 'error' : ''}
              help={errors.address?.message}
            >
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Введите адрес"
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
              label={<Text style={{ color: '#69b1ff' }}>WhatsApp</Text>}
              validateStatus={errors.whatsapp ? 'error' : ''}
              help={errors.whatsapp?.message}
            >
              <Controller
                name="whatsapp"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Введите WhatsApp"
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
              label={<Text style={{ color: '#69b1ff' }}>Telegram</Text>}
              validateStatus={errors.telegram ? 'error' : ''}
              help={errors.telegram?.message}
            >
              <Controller
                name="telegram"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Введите Telegram"
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
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ContactsManager;
