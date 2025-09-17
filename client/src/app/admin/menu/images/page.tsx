'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import SearchFilter from '../components/SearchFilter';
import {
  getAllImages,
  uploadImage,
  deleteImage,
} from '@/entities/images/api/imageThunkApi';
import {
  Button,
  Card,
  Upload,
  Spin,
  message,
  Modal,
  Image,
  Layout,
  Typography,
  Form,
} from 'antd/es';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

const { Meta } = Card;
const { Text } = Typography;
const { Content } = Layout;

const ImageManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { images, loading, error } = useAppSelector((state) => state.image);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteFilename, setDeleteFilename] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filteredImages, setFilteredImages] = useState(images);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('Fetching images...');
    dispatch(getAllImages());
  }, [dispatch]);

  useEffect(() => {
    setFilteredImages(images);
  }, [images]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredImages(images);
      return;
    }

    const filtered = images.filter((image) =>
      ['filename', 'usedIn'].some((field) => {
        const value = image[field as keyof typeof image];
        
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
    
    setFilteredImages(filtered);
  }, [images, searchTerm]);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (error) {
      console.error('ImageManager error:', error);
      message.error(error);
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [error]);

  const margin = windowWidth < 765 ? '60px auto' : '0px auto';

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleDelete = (filename: string) => {
    setDeleteFilename(filename);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (deleteFilename !== null) {
      try {
        await dispatch(deleteImage(deleteFilename)).unwrap();
        message.success('Изображение удалено');
        setIsDeleteModalVisible(false);
        dispatch(getAllImages());
      } catch (err: any) {
        console.error('Delete error:', err);
        message.error(err?.message || 'Ошибка удаления');
        setIsDeleteModalVisible(false);
      }
    }
  };

  const onFinish = async () => {
    const formData = new FormData();
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
    } else {
      message.error('Пожалуйста, выберите изображение');
      return;
    }

    try {
      await dispatch(uploadImage(formData)).unwrap();
      message.success('Изображение загружено');
      handleCancel();
      dispatch(getAllImages());
    } catch (err: any) {
      console.error('Upload error:', err);
      message.error(err.message || 'Ошибка загрузки');
    }
  };

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: UploadFile) => {
      if (file.size && file.size > 5 * 1024 * 1024) {
        message.error('Файл слишком большой (максимум 5MB)');
        return false;
      }
      setFileList([
        {
          uid: Math.random().toString(36).substring(2),
          name: file.name || 'image',
          status: 'done',
          originFileObj: file as RcFile,
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
            <Text style={{ color: '#69b1ff', fontSize: 18, fontWeight: 'bold' }}>
              Управление изображениями
            </Text>
          }
          extra={
            <Button
              type="text"
              icon={<PlusOutlined style={{ color: '#69b1ff' }} />}
              onClick={showModal}
              style={{ color: '#69b1ff', padding: 0 }}
            >
              Добавить изображение
            </Button>
          }
          style={{
            background: 'transparent',
            padding: 8,
            borderRadius: 8,
            color: '#69b1ff',
          }}
          styles={{ body: { padding: 16 } }}
        >
          <Spin spinning={loading}>
            {images.length === 0 && !loading ? (
              <Text style={{ color: '#69b1ff' }}>Изображения отсутствуют</Text>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <SearchFilter
                  placeholder="Поиск по названию или использованию..."
                  onSearchChange={setSearchTerm}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {filteredImages.map((img) => (
                    <Card
                    key={img.filename}
                    hoverable
                    style={{
                      background: 'transparent',
                      border: '2px solid #64748b',
                      borderRadius: 12,
                    }}
                    cover={
                      <Image
                        src={
                          img.url ||
                          `${process.env.NEXT_PUBLIC_UPLOADS_URL ? `${process.env.NEXT_PUBLIC_UPLOADS_URL}/${img.filename}` : 'http://localhost:3001/uploads'}/${img.filename}`
                        }
                        alt={img.filename}
                        style={{
                          width: '100%',
                          maxHeight: 120,
                          objectFit: 'contain',
                          borderRadius: '8px 8px 0 0',
                        }}
                        preview={{ src: img.url }}
                      />
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#fd9b9b' }} />}
                        onClick={() => handleDelete(img.filename)}
                        style={{ color: '#fd9b9b', padding: 0 }}
                        disabled={img.filename === 'icon_oktogon.png' || img.filename === 'icon_oktogon.ico'}
                      />,
                    ]}
                    styles={{ actions: { background: 'transparent' } }}
                  >
                    <Meta
                      title={
                        <Text style={{ color: '#69b1ff' }} ellipsis>
                          {img.filename}
                        </Text>
                      }
                      description={
                        <Text style={{ color: '#a3bffa' }}>
                          Используется в:<br />
                          {img.usedIn.slice(0, 2).join(', ') || 'Не используется'}
                        </Text>
                      }
                    />
                  </Card>
                  ))}
                </div>
              </div>
            )}
          </Spin>
        </Card>

        <Modal
          title={
            <Text style={{ color: '#69b1ff', fontSize: 18, fontWeight: 'bold' }}>
              Добавить изображение
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
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{
              color: '#69b1ff',
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Form.Item
              label={<Text style={{ color: '#69b1ff' }}>Изображение</Text>}
              name="image"
              rules={[{ required: true, message: 'Пожалуйста, выберите изображение' }]}
            >
              <Upload {...uploadProps}>
                <Button
                  type="text"
                  icon={<UploadOutlined style={{ color: '#69b1ff' }} />}
                  style={{ color: '#69b1ff', padding: 0 }}
                >
                  Выбрать файл
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="text"
                htmlType="submit"
                loading={loading}
                style={{ color: '#69b1ff', padding: 0 }}
              >
                Загрузить
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          open={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={confirmDelete}
          okText="Удалить"
          cancelText="Отмена"
          title={
            <Text style={{ color: '#69b1ff' }}>
              Вы уверены, что хотите удалить изображение?
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
      </Content>
    </Layout>
  );
};

export default ImageManager;
