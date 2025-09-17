// Указывает, что компонент является клиентским в Next.js, для выполнения на стороне клиента
'use client';

// Импортируем React и хуки useEffect, useState для управления состоянием и эффектами
import React, { useEffect, useState } from 'react';
// Импортируем компонент поиска
import SearchFilter from '../../components/SearchFilter';
// Импортируем пользовательский хук для отправки действий в Redux store
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
// Импортируем пользовательский хук для получения данных из Redux store
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
// Импортируем функции API для взаимодействия с портфолио
import {
  createMyWork, // Функция для создания новой работы
  getAllMyWorks, // Функция для получения списка всех работ
  getMyWorkById, // Функция для получения работы по её ID
  updateMyWork, // Функция для обновления существующей работы
  deleteMyWork, // Функция для удаления работы
} from '@/entities/my-work/api/portfolio';
// Импортируем действие для очистки текущей работы в Redux store
import { clearCurrentWork } from '@/entities/my-work/slice/portfolioSlice';
// Импортируем тип данных для структуры работы (MyWork)
import { MyWork } from '@/entities/my-work/model';
// Импортируем компоненты Ant Design для построения пользовательского интерфейса
import {
  Button, // Компонент кнопки
  Modal, // Компонент модального окна
  Upload, // Компонент для загрузки файлов
  Spin, // Компонент спиннера для индикации загрузки
  Form, // Компонент формы для управления вводом данных
  Input, // Компонент поля ввода
  message, // Компонент для отображения уведомлений
  Space, // Компонент для управления расстояниями между элементами
  Card, // Компонент карточки для отображения данных
  Image, // Компонент для отображения изображений
  List, // Компонент для отображения списков
  Typography, // Компонент для стилизации текста
  Layout, // Компонент для создания макета страницы
} from 'antd/es';
// Импортируем иконки Ant Design для использования в интерфейсе
import {
  UploadOutlined, // Иконка для загрузки файлов
  EditOutlined, // Иконка для редактирования
  DeleteOutlined, // Иконка для удаления
  PlusOutlined, // Иконка для добавления элементов
  MinusOutlined, // Иконка для удаления элементов
} from '@ant-design/icons';
// Импортируем типы для работы с файлами в компоненте Upload
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

// Извлекаем компонент Text из Typography для использования стилизованного текста
const { Text } = Typography;
// Извлекаем компонент Content из Layout для создания основного содержимого страницы
const { Content } = Layout;
// Извлекаем компонент TextArea из Input для ввода многострочного текста
const { TextArea } = Input;

// Определяем функциональный компонент PortfolioManager
const PortfolioManager = () => {
  // Получаем функцию dispatch для отправки действий в Redux store
  const dispatch = useAppDispatch();
  // Извлекаем данные из Redux store: список работ, текущую работу, состояние загрузки и ошибку
  const { works, currentWork, loading, error } = useAppSelector((state) => state.myWork);
  // Создаем экземпляр формы с помощью хука Ant Design Form для управления формой
  const [form] = Form.useForm();
  // Состояние для управления видимостью модального окна создания/редактирования
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Состояние для управления видимостью модального окна подтверждения удаления
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  // Состояние для хранения ID работы, предназначенной для удаления
  const [deleteId, setDeleteId] = useState<number | null>(null);
  // Состояние для хранения списка загруженных файлов для компонента Upload
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // Состояние для хранения путей изображений, отмеченных для удаления
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  // Состояние для отслеживания режима редактирования (true - редактирование, false - создание)
  const [editMode, setEditMode] = useState(false);
  // Состояние для управления текущей страницей пагинации
  const [currentPage, setCurrentPage] = useState(1);
  // Состояние для хранения отфильтрованных работ
  const [filteredWorks, setFilteredWorks] = useState(works);
  const [searchTerm, setSearchTerm] = useState('');

  // Определяем количество работ на одной странице для пагинации
  const pageSize = 1;

  // Эффект для загрузки всех работ при монтировании компонента или изменении dispatch
  useEffect(() => {
    dispatch(getAllMyWorks()); // Отправляем действие для получения всех работ с сервера
  }, [dispatch]); // Зависимость от dispatch

  useEffect(() => {
    setFilteredWorks(works);
  }, [works]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWorks(works);
      return;
    }

    const filtered = works.filter((work) =>
      ['title', 'square', 'quantity', 'time', 'success_work'].some((field) => {
        const value = work[field as keyof typeof work];
        
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
    
    setFilteredWorks(filtered);
  }, [works, searchTerm]);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  // Эффект для отображения ошибок из Redux store
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

  // Эффект для заполнения формы и списка файлов при редактировании работы
  useEffect(() => {
    if (currentWork && editMode) {
      // Если есть текущая работа и включен режим редактирования
      const successWorkArray = Array.isArray(currentWork.success_work) // Проверяем, является ли success_work массивом
        ? currentWork.success_work // Используем массив, если он существует
        : ['']; // Иначе используем пустую строку в массиве

      form.setFieldsValue({
        // Устанавливаем значения полей формы
        title: currentWork.title, // Название работы
        square: currentWork.square, // Площадь работы
        quantity: currentWork.quantity, // Количество
        time: currentWork.time, // Время выполнения
        success_work: successWorkArray, // Список выполненных задач
      });

      if (
        currentWork.image &&
        Array.isArray(currentWork.image) &&
        currentWork.image.length > 0
      ) {
        // Если есть изображения и это массив
        setFileList(
          // Устанавливаем список файлов для компонента Upload
          currentWork.image.map((img, index) => ({
            // Преобразуем пути изображений в объекты UploadFile
            uid: `-${index + 1}`, // Уникальный идентификатор файла
            name: `image-${index + 1}`, // Имя файла
            status: 'done', // Статус загрузки
            url: `${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${img}`, // Полный URL изображения
          })),
        );
      } else {
        setFileList([]); // Если изображений нет, очищаем список файлов
      }
      setRemovedImages([]); // Очищаем список удаленных изображений
    } else {
      form.resetFields(); // Сбрасываем все поля формы
      setFileList([]); // Очищаем список файлов
      setRemovedImages([]); // Очищаем список удаленных изображений
    }
  }, [currentWork, editMode, form]); // Зависимости: текущая работа, режим редактирования, форма

  // Функция для открытия модального окна
  const showModal = () => setIsModalVisible(true); // Устанавливаем isModalVisible в true

  // Функция для закрытия модального окна и сброса состояний
  const handleCancel = () => {
    setIsModalVisible(false); // Закрываем модальное окно
    setEditMode(false); // Отключаем режим редактирования
    dispatch(clearCurrentWork()); // Очищаем текущую работу в Redux store
    form.resetFields(); // Сбрасываем поля формы
    setFileList([]); // Очищаем список файлов
    setRemovedImages([]); // Очищаем список удаленных изображений
  };

  // Функция для создания новой работы
  const handleCreate = () => {
    setEditMode(false); // Отключаем режим редактирования
    dispatch(clearCurrentWork()); // Очищаем текущую работу в Redux
    showModal(); // Открываем модальное окно
  };

  // Функция для редактирования существующей работы
  const handleEdit = (id: number) => {
    dispatch(getMyWorkById(id)); // Запрашиваем работу по ID
    setEditMode(true); // Включаем режим редактирования
    showModal(); // Открываем модальное окно
  };

  // Функция для подготовки к удалению работы
  const handleDelete = (id: number) => {
    setDeleteId(id); // Устанавливаем ID работы для удаления
    setIsDeleteModalVisible(true); // Открываем модальное окно подтверждения удаления
  };

  // Функция для подтверждения удаления работы
  const confirmDelete = async () => {
    if (deleteId !== null) {
      // Проверяем, есть ли ID для удаления
      try {
        await dispatch(deleteMyWork(deleteId)).unwrap(); // Выполняем удаление работы
        message.success('Работа удалена'); // Показываем уведомление об успешном удалении
        setIsDeleteModalVisible(false); // Закрываем модальное окно
        dispatch(getAllMyWorks()); // Обновляем список работ
      } catch (err) {
        message.error('Ошибка при удалении'); // Показываем уведомление об ошибке
        console.error('Ошибка при удалении:', err); // Логируем ошибку в консоль
        setIsDeleteModalVisible(false); // Закрываем модальное окно
      }
    }
  };

  // Функция для обработки отправки формы
  const onFinish = async (
    values: Omit<MyWork, 'id' | 'image' | 'createdAt' | 'updatedAt'>,
  ) => {
    const formData = new FormData();

    // Добавляем текстовые поля
    formData.append('title', values.title || '');
    formData.append('square', values.square || '');
    formData.append('quantity', values.quantity || '');
    formData.append('time', values.time || '');

    // Добавляем success_work как JSON строку
    if (Array.isArray(values.success_work)) {
      formData.append('success_work', JSON.stringify(values.success_work));
    }

    // Новые файлы
    fileList.forEach((file) => {
      if (file.originFileObj) {
        console.log('Adding file:', file.name, file.originFileObj);
        formData.append('images', file.originFileObj);
      }
    });

    // Существующие изображения
    const existingImages = fileList
      .filter((file) => file.url && !file.originFileObj)
      .map((file) => file.url!.replace(process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001', ''));

    if (existingImages.length > 0) {
      formData.append('existing_images', JSON.stringify(existingImages));
    }

    // Удаленные изображения
    if (removedImages.length > 0) {
      formData.append('removed_images', JSON.stringify(removedImages));
    }

    console.log('Sending form data:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      if (editMode && currentWork) {
        await dispatch(updateMyWork({ id: currentWork.id, formData })).unwrap();
        message.success('Работа обновлена');
      } else {
        await dispatch(createMyWork(formData)).unwrap();
        message.success('Работа создана');
      }
      handleCancel();
      dispatch(getAllMyWorks());
    } catch (err) {
      message.error('Ошибка при сохранении');
      console.error('Ошибка:', err);
    }
  }; // Настройки для компонента Upload
  const uploadProps = {
    multiple: true, // Разрешаем множественную загрузку файлов
    listType: 'picture-card' as const, // Устанавливаем тип отображения как карточки с изображениями
    onRemove: (file: UploadFile) => {
      // Обработчик удаления файла
      if (file.url) {
        // Если файл имеет URL (существующий файл)
        // Existing image removed
        setRemovedImages((prev) => [
          // Добавляем путь удаленного изображения в список
          ...prev,
          file.url!.replace(process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001', ''), // Убираем базовый URL
        ]);
      }
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid)); // Удаляем файл из списка
    },
    beforeUpload: (file: RcFile) => {
      // Обработчик перед загрузкой файла
      setFileList((prev) => [
        // Добавляем новый файл в список
        ...prev,
        {
          uid: Math.random().toString(36).substring(2), // Генерируем уникальный ID
          name: file.name, // Имя файла
          status: 'done', // Статус загрузки
          originFileObj: file, // Исходный объект файла
        },
      ]);
      return false; // Отключаем автоматическую загрузку на сервер
    },
    fileList, // Передаем текущий список файлов
    maxCount: 20, // Ограничиваем максимальное количество файлов до 20
  };

  // Выбираем работы для отображения на текущей странице (пагинация)
  const paginatedWorks = filteredWorks.slice(
    (currentPage - 1) * pageSize, // Начальный индекс для текущей страницы
    currentPage * pageSize, // Конечный индекс для текущей страницы
  );

  // Рендерим основной макет компонента
  return (
    <Layout style={{ minWidth: '80vw', background: 'transparent' }}>
      {/* Основной контейнер макета */}
      <Content
        style={{
          width: '100%', // Полная ширина
          margin, // Отступы сверху и по бокам
          background: 'transparent', // Прозрачный фон
          height: 'auto', // Автоматическая высота
          padding: 8, // Внутренние отступы
          borderRadius: 8, // Скругленные углы
        }}
      >
        <Card
          title={
            <Text style={{ color: '#69b1ff', fontSize: 18 }}>Управление работами</Text>
          } // Заголовок карточки
          extra={
            <Button
              type="text" // Текстовый стиль кнопки
              icon={<PlusOutlined style={{ color: '#69b1ff' }} />} // Иконка добавления
              onClick={handleCreate} // Обработчик для создания новой работы
              style={{ color: '#69b1ff', padding: 0 }} // Стили кнопки
            >
              Добавить работу
            </Button> // Кнопка для добавления новой работы
          }
          style={{
            background: 'transparent', // Прозрачный фон
            padding: 8, // Внутренние отступы
            borderRadius: 8, // Скругленные углы
            color: '#69b1ff', // Цвет текста
          }}
          styles={{ body: { padding: 18 } }} // Стили для тела карточки
        >
          <Spin spinning={loading}>
            {/* Спиннер для индикации загрузки */}
            {works.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <SearchFilter
                  placeholder="Поиск по названию, площади, количеству, времени или выполненным работам..."
                  onSearchChange={setSearchTerm}
                />
              </div>
            )}
            {paginatedWorks.map(
              (
                work, // Перебираем работы для текущей страницы
              ) => (
                <Card
                  key={work.id} // Уникальный ключ для каждой карточки
                  style={{
                    background: 'transparent', // Прозрачный фон
                    border: '2px solid #64748b', // Граница карточки
                    borderRadius: 12, // Скругленные углы
                  }}
                  actions={[
                    <Button
                      type="text" // Текстовый стиль кнопки
                      icon={<EditOutlined style={{ color: '#69b1ff' }} />} // Иконка редактирования
                      onClick={() => handleEdit(work.id)} // Обработчик редактирования
                      style={{ color: '#69b1ff', padding: 0 }} // Стили кнопки
                    />,
                    <Button
                      type="text" // Текстовый стиль кнопки
                      icon={<DeleteOutlined style={{ color: '#fd9b9b' }} />} // Иконка удаления
                      onClick={() => handleDelete(work.id)} // Обработчик удаления
                      style={{ color: '#fd9b9b', padding: 0 }} // Стили кнопки
                    />,
                  ]}
                  styles={{ actions: { background: 'transparent' } }} // Стили для действий
                >
                  <Card.Meta
                    title={
                      <Text
                        style={{ color: '#69b1ff', fontSize: 20, fontWeight: 'bold' }}
                      >
                        Работа #{work.id}
                      </Text> // Заголовок карточки с ID работы
                    }
                    description={
                      <div style={{ padding: 0 }}>
                        {/* Контейнер для описания работы */}
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Название:
                          </Text>
                          {/* Метка для названия */}
                          <div
                            style={{
                              background: '#1e293b', // Фон блока
                              padding: 8, // Внутренние отступы
                              borderRadius: 6, // Скругленные углы
                              marginTop: 4, // Отступ сверху
                              color: '#a3bffa', // Цвет текста
                              minHeight: 20, // Минимальная высота
                            }}
                          >
                            {work.title || '-'}
                            {/* Отображаем название или дефис, если пусто */}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Площадь:
                          </Text>
                          {/* Метка для площади */}
                          <div
                            style={{
                              background: '#1e293b', // Фон блока
                              padding: 8, // Внутренние отступы
                              borderRadius: 6, // Скругленные углы
                              marginTop: 4, // Отступ сверху
                              color: '#a3bffa', // Цвет текста
                              minHeight: 20, // Минимальная высота
                            }}
                          >
                            {work.square || '-'}
                            {/* Отображаем площадь или дефис, если пусто */}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Количество:
                          </Text>
                          {/* Метка для количества */}
                          <div
                            style={{
                              background: '#1e293b', // Фон блока
                              padding: 8, // Внутренние отступы
                              borderRadius: 6, // Скругленные углы
                              marginTop: 4, // Отступ сверху
                              color: '#a3bffa', // Цвет текста
                              minHeight: 20, // Минимальная высота
                            }}
                          >
                            {work.quantity || '-'}
                            {/* Отображаем количество или дефис, если пусто */}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Время:
                          </Text>
                          {/* Метка для времени */}
                          <div
                            style={{
                              background: '#1e293b', // Фон блока
                              padding: 8, // Внутренние отступы
                              borderRadius: 6, // Скругленные углы
                              marginTop: 4, // Отступ сверху
                              color: '#a3bffa', // Цвет текста
                              minHeight: 20, // Минимальная высота
                            }}
                          >
                            {work.time || '-'}
                            {/* Отображаем время или дефис, если пусто */}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                            Что сделано:
                          </Text>
                          {/* Метка для списка задач */}
                          <div
                            style={{
                              background: '#1e293b', // Фон блока
                              padding: 8, // Внутренние отступы
                              borderRadius: 6, // Скругленные углы
                              marginTop: 4, // Отступ сверху
                              color: '#a3bffa', // Цвет текста
                              minHeight: 20, // Минимальная высота
                            }}
                          >
                            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                              {/* Список без маркеров */}
                              {(Array.isArray(work.success_work)
                                ? work.success_work
                                : JSON.parse(work.success_work)
                              ).map(
                                (
                                  item: string,
                                  index: number, // Перебираем задачи
                                ) => (
                                  <li
                                    key={index} // Уникальный ключ для элемента списка
                                    style={{
                                      position: 'relative', // Позиционирование для иконки
                                      paddingLeft: '22px', // Отступ для иконки
                                      marginBottom: '8px', // Отступ снизу
                                      color: '#a3bffa', // Цвет текста
                                      lineHeight: '1.4', // Межстрочный интервал
                                    }}
                                  >
                                    <span
                                      style={{
                                        position: 'absolute', // Абсолютное позиционирование
                                        left: '0', // Положение слева
                                        color: '#69b1ff', // Цвет иконки
                                        fontSize: '0.9rem', // Размер шрифта
                                        top: '2px', // Отступ сверху
                                      }}
                                    >
                                      ✔
                                    </span>
                                    {/* Иконка галочки */}
                                    {item} {/* Текст выполненной задачи */}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                        {Array.isArray(work.image) &&
                          work.image.length > 0 && ( // Если есть изображения
                            <div style={{ marginBottom: 12 }}>
                              <Text style={{ color: '#69b1ff', fontWeight: 'bold' }}>
                                Изображения:
                              </Text>
                              {/* Метка для изображений */}
                              <div
                                style={{
                                  display: 'flex', // Flex-контейнер
                                  flexWrap: 'wrap', // Перенос элементов
                                  gap: 8, // Отступ между изображениями
                                  marginTop: 4, // Отступ сверху
                                }}
                              >
                                {work.image.map(
                                  (
                                    img,
                                    index, // Перебираем изображения
                                  ) => (
                                    <Image
                                      key={index} // Уникальный ключ
                                      src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${img}`} // URL изображения
                                      alt={`Изображение ${index + 1}`} // Альтернативный текст
                                      style={{
                                        width: 50, // Ширина изображения
                                        height: 50, // Высота изображения
                                        objectFit: 'cover', // Режим отображения
                                        borderRadius: 4, // Скругленные углы
                                      }}
                                      preview={{
                                        src: `${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${img}`,
                                      }} // Предпросмотр изображения
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    }
                  />
                </Card>
              ),
            )}
          </Spin>

          {filteredWorks.length > pageSize && ( // Если отфильтрованных работ больше, чем pageSize
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              {/* Контейнер для пагинации */}
              <Button
                type="text" // Текстовый стиль кнопки
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // Переход на предыдущую страницу
                disabled={currentPage === 1} // Отключаем кнопку, если на первой странице
                style={{ color: '#69b1ff', padding: 0, marginRight: 8 }} // Стили кнопки
              >
                Предыдущая
              </Button>
              {/* Кнопка для перехода на предыдущую страницу */}
              <Text style={{ color: '#69b1ff', margin: '0 16px' }}>
                Страница {currentPage} из {Math.ceil(filteredWorks.length / pageSize)}
              </Text>
              {/* Отображаем текущую страницу и общее количество страниц */}
              <Button
                type="text" // Текстовый стиль кнопки
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(works.length / pageSize)),
                  )
                } // Переход на следующую страницу
                disabled={currentPage === Math.ceil(filteredWorks.length / pageSize)} // Отключаем кнопку, если на последней странице
                style={{ color: '#69b1ff', padding: 0, marginLeft: 8 }} // Стили кнопки
              >
                Следующая
              </Button>
              {/* Кнопка для перехода на следующую страницу */}
            </div>
          )}

          <Modal
            title={
              <Text style={{ color: '#69b1ff', fontSize: 18, fontWeight: 'bold' }}>
                {editMode
                  ? 'Редактировать работу'
                  : currentWork
                  ? `${currentWork.title}`
                  : 'Добавить работу'}
              </Text> // Заголовок модального окна в зависимости от режима
            }
            open={isModalVisible} // Управление видимостью модального окна
            onCancel={handleCancel} // Обработчик закрытия модального окна
            footer={null} // Отключаем стандартный футер модального окна
            styles={{
              content: {
                background:
                  'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)', // Градиентный фон
                borderRadius: 8, // Скругленные углы
              },
              body: {
                padding: 16, // Внутренние отступы
                background: 'transparent', // Прозрачный фон
                color: '#69b1ff', // Цвет текста
              },
              header: {
                background: 'transparent', // Прозрачный фон заголовка
              },
            }}
          >
            {!editMode && currentWork ? ( // Если не режим редактирования и есть текущая работа
              <div
                style={{
                  lineHeight: 1.8, // Межстрочный интервал
                  color: '#69b1ff', // Цвет текста
                  display: 'flex', // Flex-контейнер
                  padding: 16, // Внутренние отступы
                  borderRadius: 8, // Скругленные углы
                }}
              >
                {Array.isArray(currentWork.image) &&
                  currentWork.image.length > 0 && ( // Если есть изображения
                    <div style={{ marginTop: 12, flex: '0 0 40%' }}>
                      {/* Контейнер для изображений */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {/* Flex-контейнер для изображений */}
                        {currentWork.image.map(
                          (
                            img,
                            index, // Перебираем изображения
                          ) => (
                            <Image
                              key={index} // Уникальный ключ
                              src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${img}`} // URL изображения
                              alt={`Изображение ${index + 1}`} // Альтернативный текст
                              style={{
                                width: 50, // Ширина изображения
                                height: 50, // Высота изображения
                                objectFit: 'cover', // Режим отображения
                                borderRadius: 4, // Скругленные углы
                              }}
                              preview={{ src: `${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${img}` }} // Предпросмотр изображения
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
                <div style={{ marginLeft: '12%', flex: 1 }}>
                  {/* Контейнер для информации */}
                  <div style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#69b1ff' }}>
                      <b>Площадь:</b> {currentWork.square || '-'}
                    </Text>
                    {/* Отображаем площадь или дефис, если пусто */}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#69b1ff' }}>
                      <b>Количество:</b> {currentWork.quantity || '-'}
                    </Text>
                    {/* Отображаем количество или дефис, если пусто */}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#69b1ff' }}>
                      <b>Время:</b> {currentWork.time || '-'}
                    </Text>
                    {/* Отображаем время или дефис, если пусто */}
                  </div>
                  <div>
                    <Text style={{ color: '#69b1ff' }}>
                      <b>Что сделано:</b>
                    </Text>
                    {/* Метка для списка задач */}
                    <List
                      size="small" // Размер списка
                      dataSource={
                        Array.isArray(currentWork.success_work)
                          ? currentWork.success_work
                          : []
                      } // Источник данных
                      renderItem={(
                        item: string, // Рендерим каждый элемент списка
                      ) => (
                        <List.Item
                          style={{ color: '#69b1ff', borderBottom: '1px solid #64748b' }} // Стили элемента
                        >
                          {item} {/* Текст выполненной задачи */}
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Form
                form={form} // Привязываем форму к экземпляру
                layout="vertical" // Вертикальный макет формы
                onFinish={onFinish} // Обработчик отправки формы
                initialValues={{
                  title: '', // Начальное значение для названия
                  square: '', // Начальное значение для площади
                  quantity: '', // Начальное значение для количества
                  time: '', // Начальное значение для времени
                  success_work: '', // Начальное значение для списка задач
                }}
                style={{
                  color: '#69b1ff', // Цвет текста
                  padding: 16, // Внутренние отступы
                  borderRadius: 8, // Скругленные углы
                }}
              >
                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Название</Text>} // Метка поля
                  name="title" // Имя поля
                  rules={[{ required: true, message: 'Введите название' }]} // Правило валидации
                >
                  <Input
                    style={{
                      background: '#334155', // Фон поля
                      color: '#69b1ff', // Цвет текста
                      border: '1px solid #64748b', // Граница
                      borderRadius: 4, // Скругленные углы
                    }}
                  />
                  {/* Поле ввода названия */}
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Площадь</Text>} // Метка поля
                  name="square" // Имя поля
                >
                  <Input
                    style={{
                      background: '#334155', // Фон поля
                      color: '#69b1ff', // Цвет текста
                      border: '1px solid #64748b', // Граница
                      borderRadius: 4, // Скругленные углы
                    }}
                  />
                  {/* Поле ввода площади */}
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Количество</Text>} // Метка поля
                  name="quantity" // Имя поля
                >
                  <Input
                    style={{
                      background: '#334155', // Фон поля
                      color: '#69b1ff', // Цвет текста
                      border: '1px solid #64748b', // Граница
                      borderRadius: 4, // Скругленные углы
                    }}
                  />
                  {/* Поле ввода количества */}
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: '#69b1ff' }}>Время</Text>} // Метка поля
                  name="time" // Имя поля
                >
                  <Input
                    style={{
                      background: '#334155', // Фон поля
                      color: '#69b1ff', // Цвет текста
                      border: '1px solid #64748b', // Граница
                      borderRadius: 4, // Скругленные углы
                    }}
                  />
                  {/* Поле ввода времени */}
                </Form.Item>

                {/* Динамический список для задач */}
                <Form.List name="success_work">
                  {(
                    fields,
                    { add, remove }, // Получаем поля и методы для управления списком
                  ) => (
                    <>
                      {fields.map(
                        (
                          { key, name, ...restField }, // Перебираем поля
                        ) => (
                          <Form.Item
                            key={key} // Уникальный ключ
                            label={
                              <Text style={{ color: '#69b1ff' }}>{`Описание ${
                                name + 1
                              }`}</Text>
                            } // Метка поля
                            {...restField}
                            name={name} // Имя поля
                          >
                            <TextArea
                              style={{
                                background: '#334155', // Фон текстового поля
                                color: '#69b1ff', // Цвет текста
                                border: '1px solid #64748b', // Граница
                                borderRadius: 4, // Скругленные углы
                              }}
                            />
                            {/* Текстовое поле для описания */}
                          </Form.Item>
                        ),
                      )}
                      <Form.Item>
                        <Button
                          type="text" // Текстовый стиль кнопки
                          onClick={() => add()} // Добавляем новое поле
                          icon={<PlusOutlined style={{ color: '#69b1ff' }} />} // Иконка добавления
                          style={{ color: '#69b1ff', padding: 0 }} // Стили кнопки
                        >
                          Добавить описание
                        </Button>
                        {/* Кнопка для добавления описания */}
                        {fields.length > 1 && (
                          <Button
                            type="text" // Текстовый стиль кнопки
                            onClick={() => remove(fields.length - 1)} // Удаляем последнее поле
                            icon={<MinusOutlined style={{ color: '#fd9b9b' }} />} // Иконка удаления
                            style={{ color: '#fd9b9b', padding: 0, marginLeft: 8 }} // Стили кнопки
                          >
                            Удалить описание
                          </Button> // Кнопка для удаления описания
                        )}
                      </Form.Item>
                    </>
                  )}
                </Form.List>

                <Form.Item label={<Text style={{ color: '#69b1ff' }}>Изображения</Text>}>
                  {/* Метка для загрузки */}
                  <Upload {...uploadProps}>
                    {/* Компонент загрузки файлов */}
                    <Button
                      type="text" // Текстовый стиль кнопки
                      icon={<UploadOutlined style={{ color: '#69b1ff' }} />} // Иконка загрузки
                      style={{ color: '#69b1ff', padding: 0 }} // Стили кнопки
                    >
                      Выбрать файлы
                    </Button>
                    {/* Кнопка для выбора файлов */}
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="text" // Текстовый стиль кнопки
                    htmlType="submit" // Тип кнопки для отправки формы
                    loading={loading} // Индикатор загрузки
                    style={{ color: '#69b1ff', padding: 0 }} // Стили кнопки
                  >
                    {editMode ? 'Обновить' : 'Создать'}
                    {/* Текст кнопки в зависимости от режима */}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Modal>

          <Modal
            open={isDeleteModalVisible} // Управление видимостью модального окна
            onCancel={() => setIsDeleteModalVisible(false)} // Обработчик закрытия
            onOk={confirmDelete} // Обработчик подтверждения удаления
            okText="Удалить" // Текст кнопки подтверждения
            cancelText="Отмена" // Текст кнопки отмены
            title={
              <Text style={{ color: '#69b1ff' }}>
                Вы уверены, что хотите удалить работу?
              </Text>
            } // Заголовок
            styles={{
              content: {
                background:
                  'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)', // Градиентный фон
                borderRadius: 8, // Скругленные углы
                padding: 16, // Внутренние отступы
              },
              body: {
                background: 'transparent', // Прозрачный фон
                color: '#69b1ff', // Цвет текста
              },
              header: {
                background: 'transparent', // Прозрачный фон заголовка
              },
            }}
            okButtonProps={{
              style: {
                color: '#fd9b9b',
                borderColor: '#fd9b9b',
                background: 'transparent',
              }, // Стили кнопки подтверждения
            }}
            cancelButtonProps={{
              style: {
                color: '#69b1ff',
                borderColor: '#69b1ff',
                background: 'transparent',
              }, // Стили кнопки отмены
            }}
          >
            <Text style={{ color: '#69b1ff' }}>Это действие нельзя отменить.</Text>
            {/* Текст предупреждения */}
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

// Экспортируем компонент по умолчанию
export default PortfolioManager;
