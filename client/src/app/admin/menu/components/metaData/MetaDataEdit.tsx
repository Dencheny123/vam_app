'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import {
  updateMetaData,
  getAllMetaData,
  getOneMetaData,
} from '@/entities/metaData/api/metaDataThunkApi';
import { IMetaData, IMetaDataInput } from '@/entities/metaData/model/metaDataTypes';
import {
  Button,
  Form,
  Input,
  message,
  Card,
  Layout,
  Typography,
  Spin,
  Tag,
  Space,
  Image,
} from 'antd/es';
import { EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { metaDataSchema } from './metaDataSchema';

const { Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

type MetaDataFormValues = z.infer<typeof metaDataSchema>;

interface MetaDataEditorProps {
  index: number;
}

export const MetaDataEditor = ({ index }: MetaDataEditorProps) => {
  const dispatch = useAppDispatch();
  const { metaData, isLoading } = useAppSelector((state) => state.metaData);
  const [isEditing, setIsEditing] = useState<IMetaData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentMeta, setCurrentMeta] = useState<IMetaData | null>(null);
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    icons_icon: null,
    icons_shortcut: null,
    icons_apple: null,
  });
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MetaDataFormValues>({
    resolver: zodResolver(metaDataSchema),
    defaultValues: {
      id: index,
      title: '',
      description: '',
      keywords: '',
      author_name: '',
      author_url: '',
      metadataBase: '',
      alternates: '',
      openGraph_title: '',
      openGraph_description: '',
      openGraph_url: '',
      openGraph_siteName: '',
      themeColor: '#000000',
      icons_icon: '',
      icons_shortcut: '',
      icons_apple: '',
      other_geo_region: '',
      other_geo_placename: '',
      other_geo_position: '',
      other_ICBM: '',
    },
  });

  useEffect(() => {
    dispatch(getOneMetaData(index.toString()));
  }, [dispatch]);

  useEffect(() => {
    if (metaData) {
      if (metaData !== null) {
        const formattedData = {
          ...metaData,
          keywords: metaData.keywords || '',
          // Преобразуем массивы в строки для полей иконок (форма ожидает строки)
          icons_icon: Array.isArray(metaData.icons_icon)
            ? metaData.icons_icon[0] || ''
            : metaData.icons_icon || '',
          icons_shortcut: Array.isArray(metaData.icons_shortcut)
            ? metaData.icons_shortcut[0] || ''
            : metaData.icons_shortcut || '',
          icons_apple: Array.isArray(metaData.icons_apple)
            ? metaData.icons_apple[0] || ''
            : metaData.icons_apple || '',
        };
        reset(formattedData);
        setCurrentMeta(metaData); // Сохраняем оригинальные данные с массивами
      }
    }
  }, [metaData, index, reset]);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    if (isEditing) {
      const formattedEditingData = {
        ...isEditing,
        // Преобразуем массивы в строки для полей иконок
        icons_icon: Array.isArray(isEditing.icons_icon)
          ? isEditing.icons_icon[0] || ''
          : isEditing.icons_icon || '',
        icons_shortcut: Array.isArray(isEditing.icons_shortcut)
          ? isEditing.icons_shortcut[0] || ''
          : isEditing.icons_shortcut || '',
        icons_apple: Array.isArray(isEditing.icons_apple)
          ? isEditing.icons_apple[0] || ''
          : isEditing.icons_apple || '',
      };
      reset(formattedEditingData);
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isEditing, reset]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await dispatch(getAllMetaData()).unwrap();
        if (!result) {
          setApiError('Не удалось загрузить метаданные');
          message.error('Не удалось загрузить метаданные');
        }
      } catch (err) {
        setApiError('Ошибка при загрузке данных');
        message.error('Ошибка при загрузке данных');
        console.error('Ошибка загрузки:', err);
      }
    };
    loadData();
  }, [dispatch]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'icons_icon' | 'icons_shortcut' | 'icons_apple',
  ) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Валидация размера файла
      if (file.size > 5 * 1024 * 1024) {
        message.error('Файл слишком большой. Максимум 5 МБ.');
        e.target.value = ''; // Сброс input
        return;
      }

      // Валидация типа файла
      if (!file.type.startsWith('image/')) {
        message.error('Пожалуйста, выберите файл изображения.');
        e.target.value = '';
        return;
      }

      setFiles((prev) => ({ ...prev, [field]: file }));

      // Создаем preview и сохраняем URL для последующей очистки
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews((prev) => {
        // Очищаем предыдущий preview, если он был
        if (prev[field]) {
          URL.revokeObjectURL(prev[field]);
        }
        return { ...prev, [field]: previewUrl };
      });

      setValue(field, previewUrl, { shouldValidate: true });
    } catch (error) {
      console.error('Ошибка при обработке файла:', error);
      message.error('Ошибка при загрузке файла. Попробуйте другой файл.');
      e.target.value = '';
    }
  };

  const handleRemoveFile = (field: 'icons_icon' | 'icons_shortcut' | 'icons_apple') => {
    try {
      // Очищаем preview URL
      if (filePreviews[field]) {
        URL.revokeObjectURL(filePreviews[field]);
        setFilePreviews((prev) => {
          const newPreviews = { ...prev };
          delete newPreviews[field];
          return newPreviews;
        });
      }

      setFiles((prev) => ({ ...prev, [field]: null }));
      // Получаем значение из currentMeta, преобразуя массивы в строки
      const currentValue = currentMeta?.[field];
      const stringValue = Array.isArray(currentValue)
        ? currentValue[0] || ''
        : currentValue || '';
      setValue(field, stringValue, { shouldValidate: true });

      // Сброс input файла
      const fileInput = document.querySelector(
        `input[type="file"][data-field="${field}"]`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
      message.error('Ошибка при удалении файла.');
    }
  };

  const onSubmit = async (data: MetaDataFormValues) => {
    if (!currentMeta?.id) {
      message.error('Не удалось обновить: отсутствует ID метаданных');
      console.error('Cannot update: no current meta data id');
      return;
    }

    setIsUploading(true);

    try {
      const updatePayload: IMetaDataInput = {
        ...data,
        id: currentMeta.id,
      };

      // Фильтруем только файлы, которые были изменены
      const filesToSend = Object.fromEntries(
        Object.entries(files).filter(([_, file]) => file !== null),
      ) as { [key: string]: File };

      // Валидация: проверяем, что есть либо данные для обновления, либо файлы
      const hasChanges =
        Object.keys(updatePayload).some(
          (key) =>
            key !== 'id' &&
            updatePayload[key as keyof IMetaDataInput] !==
              currentMeta[key as keyof IMetaData],
        ) || Object.keys(filesToSend).length > 0;

      if (!hasChanges) {
        message.info('Нет изменений для сохранения');
        setIsUploading(false);
        return;
      }

      const updatedMetaData = await dispatch(
        updateMetaData({ id: currentMeta.id, data: updatePayload, files: filesToSend }),
      ).unwrap();

      message.success('Метаданные успешно обновлены!');
      setIsEditing(null);

      // Принудительно обновляем данные с сервера
      await dispatch(getOneMetaData(index.toString())).unwrap();

      // Очищаем preview URLs
      Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
      setFilePreviews({});
      setFiles({ icons_icon: null, icons_shortcut: null, icons_apple: null });
    } catch (error: any) {
      console.error('Update failed:', {
        error,
        formData: data,
        files,
        currentMetaId: currentMeta?.id,
      });

      let errorMessage = 'Неизвестная ошибка при обновлении';

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      message.error(`Ошибка обновления: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      const currentKeywords = watch('keywords')
        ? watch('keywords')
            .split(',')
            .map((k) => k.trim())
        : [];
      const updatedKeywords = [...currentKeywords, newKeyword.trim()]
        .filter((k) => k)
        .join(',');
      setValue('keywords', updatedKeywords, { shouldValidate: true });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    const currentKeywords = watch('keywords')
      ? watch('keywords')
          .split(',')
          .map((k) => k.trim())
      : [];
    const updatedKeywords = currentKeywords
      .filter((_, i) => i !== indexToRemove)
      .join(',');
    setValue('keywords', updatedKeywords, { shouldValidate: true });
  };

  // Очистка preview URLs при размонтировании
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  if (isLoading && !metaData) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <Spin spinning={isLoading} tip="Загрузка метаданных..." />
      </div>
    );
  }

  if (!metaData) {
    return (
      <div style={{ padding: 16, color: '#69b1ff', textAlign: 'center' }}>
        {apiError ? (
          <Text style={{ color: '#fd9b9b' }}>{apiError}</Text>
        ) : (
          <Text>Метаданные не найдены</Text>
        )}
      </div>
    );
  }

  const margin = windowWidth < 765 ? '60px auto' : '0px auto';

  return (
    <Layout style={{ background: 'transparent', minWidth: '100%' }}>
      <Content
        style={{
          width: '100%',
          margin,
          height: 'auto',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Card
          title={<Text style={{ color: '#69b1ff', fontSize: 18 }}>Метаданные</Text>}
          extra={
            <Button
              type="text"
              icon={<EditOutlined style={{ color: isEditing ? '#fd9b9b' : '#69b1ff' }} />}
              onClick={() => setIsEditing(isEditing ? null : metaData)}
              style={{ color: isEditing ? '#fd9b9b' : '#69b1ff', padding: 0 }}
            >
              {isEditing ? 'Отмена' : 'Редактировать'}
            </Button>
          }
          style={{
            background: 'transparent',
            padding: 16,
            borderRadius: 8,
            color: '#69b1ff',
          }}
        >
          <Spin spinning={isLoading}>
            {isEditing ? (
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                style={{
                  color: '#69b1ff',
                  background: 'transparent',
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                {/* Основные метаданные */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Основные метаданные
                  </Text>
                  <Form.Item
                    label={<Text style={{ color: '#69b1ff' }}>Заголовок (title)</Text>}
                    validateStatus={errors.title ? 'error' : ''}
                    help={errors.title?.message}
                  >
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="Заголовок страницы"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Описание (description)</Text>
                    }
                    validateStatus={errors.description ? 'error' : ''}
                    help={errors.description?.message}
                  >
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="Мета-описание"
                          autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Ключевые слова (keywords)</Text>
                    }
                    validateStatus={errors.keywords ? 'error' : ''}
                    help={errors.keywords?.message}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space wrap>
                        {watch('keywords')
                          ? watch('keywords')
                              .split(',')
                              .map(
                                (keyword: string, i: number) =>
                                  keyword.trim() && (
                                    <Tag
                                      key={i}
                                      style={{
                                        background: '#475569',
                                        color: '#69b1ff',
                                        border: '1px solid #64748b',
                                        borderRadius: 4,
                                        padding: '2px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {keyword.trim()}
                                      <Button
                                        type="text"
                                        icon={
                                          <MinusOutlined
                                            style={{ color: '#fd9b9b', fontSize: 12 }}
                                          />
                                        }
                                        onClick={() => handleRemoveKeyword(i)}
                                        style={{ padding: 0, marginLeft: 8 }}
                                      />
                                    </Tag>
                                  ),
                              )
                          : null}
                      </Space>
                      <Space>
                        <TextArea
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                            width: 'auto',
                            minWidth: 200,
                          }}
                          placeholder="Новое ключевое слово"
                          autoSize={{ minRows: 1, maxRows: 3 }}
                        />
                        <Button
                          type="text"
                          icon={
                            <PlusOutlined style={{ color: '#69b1ff', fontSize: 12 }} />
                          }
                          onClick={handleAddKeyword}
                          style={{ padding: 0 }}
                        >
                          Добавить
                        </Button>
                      </Space>
                    </Space>
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Имя автора (author_name)</Text>
                    }
                    validateStatus={errors.author_name ? 'error' : ''}
                    help={errors.author_name?.message}
                  >
                    <Controller
                      name="author_name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="Имя автора"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>URL автора (author_url)</Text>
                    }
                    validateStatus={errors.author_url ? 'error' : ''}
                    help={errors.author_url?.message}
                  >
                    <Controller
                      name="author_url"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="https://example.com"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Базовый URL (metadataBase)</Text>
                    }
                    validateStatus={errors.metadataBase ? 'error' : ''}
                    help={errors.metadataBase?.message}
                  >
                    <Controller
                      name="metadataBase"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="https://example.com"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>
                        Альтернативный URL (alternates)
                      </Text>
                    }
                    validateStatus={errors.alternates ? 'error' : ''}
                    help={errors.alternates?.message}
                  >
                    <Controller
                      name="alternates"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="/alternate-path"
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                {/* OpenGraph метаданные */}
                <div
                  style={{
                    marginBottom: 24,
                    borderTop: '1px solid #64748b',
                    paddingTop: 16,
                  }}
                >
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    OpenGraph метаданные
                  </Text>
                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>
                        OG Заголовок (openGraph_title)
                      </Text>
                    }
                    validateStatus={errors.openGraph_title ? 'error' : ''}
                    help={errors.openGraph_title?.message}
                  >
                    <Controller
                      name="openGraph_title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="OpenGraph заголовок"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>
                        OG Описание (openGraph_description)
                      </Text>
                    }
                    validateStatus={errors.openGraph_description ? 'error' : ''}
                    help={errors.openGraph_description?.message}
                  >
                    <Controller
                      name="openGraph_description"
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="OpenGraph описание"
                          autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>OG URL (openGraph_url)</Text>
                    }
                    validateStatus={errors.openGraph_url ? 'error' : ''}
                    help={errors.openGraph_url?.message}
                  >
                    <Controller
                      name="openGraph_url"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="https://example.com/og-path"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>
                        Название сайта (openGraph_siteName)
                      </Text>
                    }
                    validateStatus={errors.openGraph_siteName ? 'error' : ''}
                    help={errors.openGraph_siteName?.message}
                  >
                    <Controller
                      name="openGraph_siteName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="Название сайта"
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                {/* Визуальные метаданные */}
                <div
                  style={{
                    marginBottom: 24,
                    borderTop: '1px solid #64748b',
                    paddingTop: 16,
                  }}
                >
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Визуальные метаданные
                  </Text>
                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Цвет темы (themeColor)</Text>
                    }
                    validateStatus={errors.themeColor ? 'error' : ''}
                    help={errors.themeColor?.message}
                  >
                    <Space>
                      <Controller
                        name="themeColor"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{
                              background: '#334155',
                              color: '#69b1ff',
                              border: '1px solid #64748b',
                              borderRadius: 4,
                              width: 100,
                            }}
                            placeholder="#18120e"
                          />
                        )}
                      />
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 4,
                          border: '1px solid #64748b',
                          backgroundColor: watch('themeColor') || '#ffffff',
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item
                    label={<Text style={{ color: '#69b1ff' }}>Иконка (icons_icon)</Text>}
                    validateStatus={errors.icons_icon ? 'error' : ''}
                    help={errors.icons_icon?.message}
                  >
                    <Space direction="vertical">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'icons_icon')}
                        data-field="icons_icon"
                        style={{
                          background: '#334155',
                          color: '#69b1ff',
                          border: '1px solid #64748b',
                          borderRadius: 4,
                        }}
                        disabled={isUploading}
                      />
                      <Space>
                        <Image
                          src={
                            filePreviews.icons_icon ||
                            `${process.env.NEXT_PUBLIC_URL}${metaData.icons_icon[0]}` ||
                            ''
                          }
                          alt="Icon preview"
                          width={50}
                          height={50}
                          style={{ borderRadius: 4, objectFit: 'cover' }}
                          fallback="/icon_oktogon.png"
                        />
                        <Button
                          type="text"
                          icon={
                            <MinusOutlined style={{ color: '#fd9b9b', fontSize: 12 }} />
                          }
                          onClick={() => handleRemoveFile('icons_icon')}
                          style={{ padding: 0 }}
                        >
                          Удалить
                        </Button>
                      </Space>
                    </Space>
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Ярлык (icons_shortcut)</Text>
                    }
                    validateStatus={errors.icons_shortcut ? 'error' : ''}
                    help={errors.icons_shortcut?.message}
                  >
                    <Space direction="vertical">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'icons_shortcut')}
                        data-field="icons_shortcut"
                        style={{
                          background: '#334155',
                          color: '#69b1ff',
                          border: '1px solid #64748b',
                          borderRadius: 4,
                        }}
                        disabled={isUploading}
                      />
                      <Space>
                        <Image
                          src={
                            filePreviews.icons_shortcut ||
                            `${process.env.NEXT_PUBLIC_URL}${metaData.icons_shortcut[0]}` ||
                            ''
                          }
                          alt="Shortcut preview"
                          width={50}
                          height={50}
                          style={{ borderRadius: 4, objectFit: 'cover' }}
                          fallback="/icon_oktogon.png"
                        />
                        <Button
                          type="text"
                          icon={
                            <MinusOutlined style={{ color: '#fd9b9b', fontSize: 12 }} />
                          }
                          onClick={() => handleRemoveFile('icons_shortcut')}
                          style={{ padding: 0 }}
                        >
                          Удалить
                        </Button>
                      </Space>
                    </Space>
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Apple иконка (icons_apple)</Text>
                    }
                    validateStatus={errors.icons_apple ? 'error' : ''}
                    help={errors.icons_apple?.message}
                  >
                    <Space direction="vertical">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'icons_apple')}
                        data-field="icons_apple"
                        style={{
                          background: '#334155',
                          color: '#69b1ff',
                          border: '1px solid #64748b',
                          borderRadius: 4,
                        }}
                        disabled={isUploading}
                      />
                      <Space>
                        <Image
                          src={
                            filePreviews.icons_apple ||
                            `${process.env.NEXT_PUBLIC_URL}${metaData.icons_apple[0]}` ||
                            ''
                          }
                          alt="Apple icon preview"
                          width={50}
                          height={50}
                          style={{ borderRadius: 4, objectFit: 'cover' }}
                          fallback="/icon_oktogon.png"
                        />
                        <Button
                          type="text"
                          icon={
                            <MinusOutlined style={{ color: '#fd9b9b', fontSize: 12 }} />
                          }
                          onClick={() => handleRemoveFile('icons_apple')}
                          style={{ padding: 0 }}
                        >
                          Удалить
                        </Button>
                      </Space>
                    </Space>
                  </Form.Item>
                </div>

                {/* Гео метаданные */}
                <div
                  style={{
                    marginBottom: 24,
                    borderTop: '1px solid #64748b',
                    paddingTop: 16,
                  }}
                >
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Географические метаданные
                  </Text>
                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>Регион (other_geo_region)</Text>
                    }
                    validateStatus={errors.other_geo_region ? 'error' : ''}
                    help={errors.other_geo_region?.message}
                  >
                    <Controller
                      name="other_geo_region"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="RU-MOW"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>
                        Название места (other_geo_placename)
                      </Text>
                    }
                    validateStatus={errors.other_geo_placename ? 'error' : ''}
                    help={errors.other_geo_placename?.message}
                  >
                    <Controller
                      name="other_geo_placename"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="Москва"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text style={{ color: '#69b1ff' }}>
                        Координаты (other_geo_position)
                      </Text>
                    }
                    validateStatus={errors.other_geo_position ? 'error' : ''}
                    help={errors.other_geo_position?.message}
                  >
                    <Controller
                      name="other_geo_position"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="55.7558;37.6173"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<Text style={{ color: '#69b1ff' }}>{'ICBM координаты'}</Text>}
                    validateStatus={errors.other_ICBM ? 'error' : ''}
                    help={errors.other_ICBM?.message}
                  >
                    <Controller
                      name="other_ICBM"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            background: '#334155',
                            color: '#69b1ff',
                            border: '1px solid #64748b',
                            borderRadius: 4,
                          }}
                          placeholder="55.7558, 37.6173"
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Space>
                    <Button
                      type="text"
                      onClick={() => setIsEditing(null)}
                      style={{ color: '#fd9b9b', padding: 0 }}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="text"
                      htmlType="submit"
                      loading={isLoading || isUploading}
                      disabled={isUploading}
                      style={{ color: '#69b1ff', padding: 0 }}
                    >
                      {isUploading ? 'Обработка...' : 'Сохранить изменения'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Заголовок
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.title || 'Не указано'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Описание
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.description || 'Не указано'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Ключевые слова
                  </Text>
                  <div
                    style={{
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.keywords ? (
                      <Space wrap>
                        {metaData?.keywords.split(',').map(
                          (keyword: string, i: number) =>
                            keyword.trim() && (
                              <Tag
                                key={i}
                                style={{
                                  background: '#475569',
                                  color: '#69b1ff',
                                  border: '1px solid #64748b',
                                  borderRadius: 4,
                                  padding: '2px 8px',
                                }}
                              >
                                {keyword.trim()}
                              </Tag>
                            ),
                        )}
                      </Space>
                    ) : (
                      <Text style={{ color: '#69b1ff' }}>Не указаны</Text>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Автор
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.author_name || 'Не указана'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Ссылка на автора
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.author_url || 'Не указан'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Основная метадата
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.metadataBase || 'Не указан'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Альтернативные метаданные
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.alternates || 'Не указаны'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Заголовок OpenGraph
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.openGraph_title || 'Не указаны'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Описание OpenGraph
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.openGraph_description || 'Не указаны'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    URL OpenGraph
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.openGraph_url || 'Не указаны'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Название OpenGraph
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.openGraph_siteName || 'Не указаны'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Цвет темы
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{metaData?.themeColor || 'Не указан'}</span>
                    {metaData?.themeColor && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: '1px solid #64748b',
                          backgroundColor: metaData?.themeColor,
                        }}
                      />
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Иконка
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.icons_icon ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_URL}${metaData.icons_icon[0]}`}
                        alt="Icon"
                        width={50}
                        height={50}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                    ) : (
                      'Не указан'
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Короткая иконка
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.icons_shortcut ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_URL}${metaData.icons_shortcut[0]}`}
                        alt="Shortcut icon"
                        width={50}
                        height={50}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                    ) : (
                      'Не указан'
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Иконка Apple
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.icons_apple ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_URL}${metaData.icons_apple[0]}`}
                        alt="Apple icon"
                        width={50}
                        height={50}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                      />
                    ) : (
                      'Не указан'
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Регион
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.other_geo_region || 'Не указан'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Местоположение
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.other_geo_placename || 'Не указан'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Другие позиции
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.other_geo_position || 'Не указан'}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#69b1ff', fontSize: 16, fontWeight: 'bold' }}>
                    Другие ICBM
                  </Text>
                  <div
                    style={{
                      color: '#69b1ff',
                      padding: 12,
                      background: '#334155',
                      borderRadius: 4,
                      border: '1px solid #64748b',
                      marginTop: 8,
                    }}
                  >
                    {metaData?.other_ICBM || 'Не указан'}
                  </div>
                </div>
              </div>
            )}
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
};
