'use client';

import { useEffect, useState } from 'react';
import { exportOrders, availableFields, ExportOptions } from '@/shared/utils/exportUtils';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import {
  UnorderedListOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  BorderOutlined,
  BlockOutlined,
  FileTextOutlined,
  ApiOutlined,
  CoffeeOutlined,
  DownloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  FrownOutlined,
  PlusOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  getOrdersThunk,
  updateOrderThunk,
  deleteOrderThunk,
  createOrderThunk,
  updateOrdersStatusThunk,
  deleteOrdersThunk,
} from '@/entities/recording/api/RecordingFormApi';
import {
  setSearchQuery,
  setStatusFilter,
  setDateRangeFilter,
  setAmountRangeFilter,
  setSelectedStatuses,
  clearFilters,
} from '@/entities/recording/slice/ordersSlice';
import { OrderType } from '@/entities/recording/model/index';
import styles from './page.module.css';
import { formatPhoneNumber } from '@/app/contacts/components/main/Contacts&Form/contacts';
import { Select } from 'antd/es';
import { Option } from 'antd/es/mentions';

export default function OrdersPage() {
  const { user } = useAppSelector((state) => state.user);
  const {
    orders,
    loading,
    error,
    searchQuery,
    statusFilter,
    dateRangeFilter,
    amountRangeFilter,
    selectedStatuses,
  } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    personalData: false,
    oferta: false,
    mailing: false,
    status: 'NEW' as OrderType['status'],
    amount: 0,
    notes: '',
    whatsapp: '',
    telegram: '',
    address: '',
    deadline: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'pdf'>('xlsx');
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(
    availableFields.filter((f) => f.default).map((f) => f.value),
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localDateRange, setLocalDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [localAmountRange, setLocalAmountRange] = useState({
    minAmount: '',
    maxAmount: '',
  });
  const [localSelectedStatuses, setLocalSelectedStatuses] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showMassActions, setShowMassActions] = useState(false);
  const [massStatus, setMassStatus] = useState<OrderType['status']>('NEW');
  const [showMassDeleteConfirm, setShowMassDeleteConfirm] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnSettings, setColumnSettings] = useState({
    name: true,
    phone: true,
    email: true,
    message: true,
    status: true,
    amount: true,
    notes: true,
    whatsapp: true,
    telegram: true,
    address: true,
    deadline: true,
    personalData: false,
    oferta: false,
    mailing: false,
    createdAt: true,
    updatedAt: true,
  });
  const [sortField, setSortField] = useState<keyof OrderType>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<
    'list' | 'largeIcons' | 'mediumIcons' | 'smallIcons' | 'tile' | 'content'
  >('list');

  const statusOptions = [
    { value: 'NEW', label: 'Новые' },
    { value: 'IN_PROGRESS', label: 'В работе' },
    { value: 'COMPLETED', label: 'Завершенные' },
    { value: 'CANCELLED', label: 'Отмененные' },
  ];

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(getOrdersThunk());
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();

    // Загрузка сохраненных настроек колонок
    const savedColumnSettings = localStorage.getItem('orderColumnSettings');
    if (savedColumnSettings) {
      try {
        setColumnSettings(JSON.parse(savedColumnSettings));
      } catch (error) {
        console.error('Ошибка загрузки настроек колонок:', error);
      }
    }

    // Загрузка сохраненных настроек фильтров
    const savedFilterSettings = localStorage.getItem('orderFilterSettings');
    if (savedFilterSettings) {
      try {
        const filterSettings = JSON.parse(savedFilterSettings);
        dispatch(setSearchQuery(filterSettings.searchQuery || ''));
        dispatch(setStatusFilter(filterSettings.statusFilter || ''));
        dispatch(
          setDateRangeFilter(
            filterSettings.dateRangeFilter || { startDate: '', endDate: '' },
          ),
        );
        dispatch(
          setAmountRangeFilter(
            filterSettings.amountRangeFilter || { minAmount: null, maxAmount: null },
          ),
        );
        dispatch(setSelectedStatuses(filterSettings.selectedStatuses || []));
        setLocalDateRange(
          filterSettings.dateRangeFilter || { startDate: '', endDate: '' },
        );
        setLocalAmountRange(
          filterSettings.amountRangeFilter || { minAmount: '', maxAmount: '' },
        );
        setLocalSelectedStatuses(filterSettings.selectedStatuses || []);
      } catch (error) {
        console.error('Ошибка загрузки настроек фильтров:', error);
      }
    }

    // Загрузка сохраненных настроек сортировки
    const savedSortSettings = localStorage.getItem('orderSortSettings');
    if (savedSortSettings) {
      try {
        const sortSettings = JSON.parse(savedSortSettings);
        setSortField(sortSettings.sortField || 'createdAt');
        setSortDirection(sortSettings.sortDirection || 'desc');
      } catch (error) {
        console.error('Ошибка загрузки настроек сортировки:', error);
      }
    }

    // Загрузка сохраненных настроек отображения
    const savedViewMode = localStorage.getItem('orderViewMode');
    if (savedViewMode) {
      try {
        setViewMode(
          savedViewMode as
            | 'list'
            | 'largeIcons'
            | 'mediumIcons'
            | 'smallIcons'
            | 'tile'
            | 'content',
        );
      } catch (error) {
        console.error('Ошибка загрузки настроек отображения:', error);
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [user, dispatch]);

  // Отладочный эффект для отслеживания изменений selectedOrders
  useEffect(() => {
    console.log('selectedOrders изменен:', selectedOrders);
  }, [selectedOrders]);

  // Сохранение настроек фильтров в localStorage при их изменении
  useEffect(() => {
    const filterSettings = {
      searchQuery,
      statusFilter,
      dateRangeFilter,
      amountRangeFilter,
      selectedStatuses,
    };
    localStorage.setItem('orderFilterSettings', JSON.stringify(filterSettings));
  }, [searchQuery, statusFilter, dateRangeFilter, amountRangeFilter, selectedStatuses]);

  // Сохранение настроек сортировки в localStorage при их изменении
  useEffect(() => {
    const sortSettings = {
      sortField,
      sortDirection,
    };
    localStorage.setItem('orderSortSettings', JSON.stringify(sortSettings));
  }, [sortField, sortDirection]);

  // Сохранение настроек отображения в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem('orderViewMode', viewMode);
  }, [viewMode]);

  const margin = windowWidth < 765 ? '60px auto' : '0px auto';

  const handleStatusChange = async (orderId: number, newStatus: OrderType['status']) => {
    try {
      await dispatch(
        updateOrderThunk({ id: orderId, data: { status: newStatus } }),
      ).unwrap();
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  const handleEditOrder = (order: OrderType) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;

    try {
      await dispatch(
        updateOrderThunk({
          id: editingOrder.id,
          data: {
            name: editingOrder.name,
            email: editingOrder.email,
            phone: editingOrder.phone,
            message: editingOrder.message,
            status: editingOrder.status,
            amount: editingOrder.amount !== null ? Number(editingOrder.amount) : null,
            notes: editingOrder.notes,
            whatsapp: editingOrder.whatsapp,
            telegram: editingOrder.telegram,
            address: editingOrder.address,
            deadline: editingOrder.deadline,
            personalData: Boolean(editingOrder.personalData),
            oferta: Boolean(editingOrder.oferta),
            mailing: Boolean(editingOrder.mailing),
          },
        }),
      ).unwrap();
      setShowEditModal(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.name.trim() || !newOrder.phone.trim()) {
      setCreateError('Имя и телефон обязательны для заполнения');
      return;
    }

    try {
      await dispatch(
        createOrderThunk({
          name: newOrder.name,
          email: newOrder.email || undefined,
          phone: newOrder.phone,
          message: newOrder.message || undefined,
          personalData: newOrder.personalData,
          oferta: newOrder.oferta,
          mailing: newOrder.mailing,
          status: newOrder.status,
          amount: newOrder.amount || undefined,
          notes: newOrder.notes || undefined,
          whatsapp: newOrder.whatsapp || undefined,
          telegram: newOrder.telegram || undefined,
          address: newOrder.address || undefined,
          deadline: newOrder.deadline || undefined,
        }),
      ).unwrap();

      setShowCreateModal(false);
      setNewOrder({
        name: '',
        email: '',
        phone: '',
        message: '',
        personalData: false,
        oferta: false,
        mailing: false,
        status: 'NEW',
        amount: 0,
        notes: '',
        whatsapp: '',
        telegram: '',
        address: '',
        deadline: '',
      });
      setCreateError(null);
    } catch (error) {
      setCreateError('Ошибка создания заказа');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      await dispatch(deleteOrderThunk(orderToDelete)).unwrap();
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleApplyDateRange = () => {
    dispatch(
      setDateRangeFilter({
        startDate: localDateRange.startDate,
        endDate: localDateRange.endDate,
      }),
    );
  };

  const handleClearDateRange = () => {
    setLocalDateRange({ startDate: '', endDate: '' });
    dispatch(setDateRangeFilter({ startDate: '', endDate: '' }));
  };

  const handleApplyAmountRange = () => {
    dispatch(
      setAmountRangeFilter({
        minAmount: localAmountRange.minAmount ? Number(localAmountRange.minAmount) : null,
        maxAmount: localAmountRange.maxAmount ? Number(localAmountRange.maxAmount) : null,
      }),
    );
  };

  const handleClearAmountRange = () => {
    setLocalAmountRange({ minAmount: '', maxAmount: '' });
    dispatch(setAmountRangeFilter({ minAmount: null, maxAmount: null }));
  };

  const handleStatusToggle = (status: string) => {
    const newSelectedStatuses = localSelectedStatuses.includes(status)
      ? localSelectedStatuses.filter((s) => s !== status)
      : [...localSelectedStatuses, status];

    setLocalSelectedStatuses(newSelectedStatuses);
    dispatch(setSelectedStatuses(newSelectedStatuses));
  };

  const handleClearStatusFilter = () => {
    setLocalSelectedStatuses([]);
    dispatch(setSelectedStatuses([]));
  };

  const handleOrderSelect = (orderId: number) => {
    console.log('Выбор заказа:', orderId, 'Текущий selectedOrders:', selectedOrders);
    setSelectedOrders((prev) => {
      const newSelected = prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId];
      console.log('Новый selectedOrders:', newSelected);
      return newSelected;
    });
  };

  const toggleMassActions = () => {
    const newShowMassActions = !showMassActions;
    setShowMassActions(newShowMassActions);
    if (!newShowMassActions) {
      // Сбрасываем выделение при закрытии массовых операций
      setSelectedOrders([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleMassStatusChange = async () => {
    if (selectedOrders.length === 0) return;

    try {
      await dispatch(
        updateOrdersStatusThunk({
          ids: selectedOrders,
          status: massStatus,
        }),
      ).unwrap();
      setSelectedOrders([]);
      setShowMassActions(false);
    } catch (error) {
      console.error('Ошибка массового изменения статуса:', error);
    }
  };

  const handleMassDelete = async () => {
    if (selectedOrders.length === 0) return;

    try {
      await dispatch(deleteOrdersThunk(selectedOrders)).unwrap();
      setSelectedOrders([]);
      setShowMassActions(false);
      setShowMassDeleteConfirm(false);
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
    }
  };

  const copyContactData = () => {
    if (selectedOrders.length === 0) return;

    const selectedOrdersData = orders.filter((order) =>
      selectedOrders.includes(order.id),
    );
    const contactData = selectedOrdersData
      .map((order) => {
        const contacts = [];
        if (order.phone) contacts.push(`Телефон: ${order.phone}`);
        if (order.email) contacts.push(`Email: ${order.email}`);
        if (order.whatsapp) contacts.push(`WhatsApp: ${order.whatsapp}`);
        if (order.telegram) contacts.push(`Telegram: ${order.telegram}`);
        if (order.address) contacts.push(`Адрес: ${order.address}`);
        return contacts.join('\n');
      })
      .join('\n\n');

    navigator.clipboard
      .writeText(contactData)
      .then(() => alert('Контактные данные скопированы в буфер обмена'))
      .catch((err) => console.error('Ошибка копирования:', err));
  };

  // Функция обработки экспорта
  const handleExport = () => {
    const options: ExportOptions = {
      format: exportFormat,
      fields: selectedExportFields,
      fileName: `заказы_${new Date().toISOString().split('T')[0]}`,
    };

    exportOrders(filteredOrders, options);
    setShowExportModal(false);
  };

  // Переключение выбора поля экспорта
  const toggleExportField = (field: string) => {
    setSelectedExportFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  // Выбор всех полей
  const selectAllExportFields = () => {
    setSelectedExportFields(availableFields.map((f) => f.value));
  };

  // Сброс выбора полей
  const resetExportFields = () => {
    setSelectedExportFields(availableFields.filter((f) => f.default).map((f) => f.value));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.address && order.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === '' || order.status === statusFilter;

    const matchesDateRange =
      (!dateRangeFilter.startDate && !dateRangeFilter.endDate) ||
      (new Date(order.createdAt) >= new Date(dateRangeFilter.startDate || '1970-01-01') &&
        new Date(order.createdAt) <= new Date(dateRangeFilter.endDate || '2100-12-31'));

    const matchesAmountRange =
      (!amountRangeFilter.minAmount && !amountRangeFilter.maxAmount) ||
      (order.amount !== null &&
        order.amount >= (amountRangeFilter.minAmount || 0) &&
        order.amount <= (amountRangeFilter.maxAmount || Number.MAX_SAFE_INTEGER));

    const matchesMultiStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(order.status);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateRange &&
      matchesAmountRange &&
      matchesMultiStatus
    );
  });

  const getStatusColor = (status: OrderType['status']) => {
    switch (status) {
      case 'NEW':
        return '#ffa500';
      case 'IN_PROGRESS':
        return '#1890ff';
      case 'COMPLETED':
        return '#52c41a';
      case 'CANCELLED':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: OrderType['status']) => {
    switch (status) {
      case 'NEW':
        return 'Новый';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'COMPLETED':
        return 'Завершен';
      case 'CANCELLED':
        return 'Отменен';
      default:
        return status;
    }
  };

  const saveColumnSettings = () => {
    localStorage.setItem('orderColumnSettings', JSON.stringify(columnSettings));
    setShowColumnSettings(false);
  };

  const toggleColumnSetting = (column: keyof typeof columnSettings) => {
    setColumnSettings((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const resetColumnSettings = () => {
    setColumnSettings({
      name: true,
      phone: true,
      email: true,
      message: true,
      status: true,
      amount: true,
      notes: true,
      whatsapp: true,
      telegram: true,
      address: true,
      deadline: true,
      personalData: false,
      oferta: false,
      mailing: false,
      createdAt: true,
      updatedAt: true,
    });
  };

  const handleSort = (field: keyof OrderType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortFieldName = (field: keyof OrderType): string => {
    const fieldNames: Partial<Record<keyof OrderType, string>> = {
      id: 'ID',
      name: 'Имя',
      email: 'Email',
      phone: 'Телефон',
      message: 'Сообщение',
      personalData: 'Согласие на обработку данных',
      oferta: 'Принятие оферты',
      mailing: 'Согласие на рассылку',
      status: 'Статус',
      amount: 'Сумма',
      notes: 'Заметки',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      address: 'Адрес',
      deadline: 'Дедлайн',
      createdAt: 'Дата создания',
      updatedAt: 'Дата обновления',
      deadlineSetAt: 'Дата установки дедлайна',
      deadlineNotified: 'Уведомление о дедлайне',
    };
    return fieldNames[field] || field.toString();
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Обработка дат
    if (
      sortField === 'createdAt' ||
      sortField === 'updatedAt' ||
      sortField === 'deadline'
    ) {
      const aDate = aValue ? new Date(aValue as string).getTime() : 0;
      const bDate = bValue ? new Date(bValue as string).getTime() : 0;
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }

    // Обработка булевых значений
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? aValue === bValue
          ? 0
          : aValue
          ? 1
          : -1
        : aValue === bValue
        ? 0
        : aValue
        ? -1
        : 1;
    }

    // Обработка чисел
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Обработка строк
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Обработка null/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    // Общая обработка для смешанных типов (приводим к строке)
    const aString = String(aValue);
    const bString = String(bValue);
    return sortDirection === 'asc'
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className={styles.container}>
        <h1>Доступ запрещен</h1>
        <p>Только администраторы могут просматривать эту страницу.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Управление заказами</h1>
        <div className={styles.loading}>Загрузка заказов...</div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ margin }}>
      <div className={styles.header}>
        <h1>Управление заказами</h1>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Поиск по имени, телефону, email или адресу..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className={styles.searchInput}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(value) => dispatch(setStatusFilter(value))}
            className={styles.filterSelect}
            dropdownClassName={styles.antSelectDropdown}
            optionRender={(option) => (
              <div className={styles.antSelectItem}>{option.label}</div>
            )}
          >
            <Option value="">Все статусы</Option>
            <Option value="NEW">
              <CoffeeOutlined />
              Новые
            </Option>
            <Option value="IN_PROGRESS">
              <ApiOutlined />В работе
            </Option>
            <Option value="COMPLETED">
              <ThunderboltOutlined />
              Завершенные
            </Option>
            <Option value="CANCELLED">
              <FrownOutlined />
              Отмененные
            </Option>
          </Select>
          <button onClick={() => dispatch(clearFilters())} className={styles.clearButton}>
            Сбросить
          </button>
          {/* Селектор режима отображения в стиле Windows Explorer */}
          <Select
            value={viewMode}
            onChange={setViewMode}
            className={styles.selectAllButton}
            title="Режим отображения"
            dropdownClassName={styles.antSelectDropdown}
            optionRender={(option) => (
              <div className={styles.antSelectItem}>{option.label}</div>
            )}
          >
            <Option value="list">
              <UnorderedListOutlined /> Список
            </Option>
            <Option value="largeIcons">
              <BorderOutlined /> Крупные значки
            </Option>
            <Option value="mediumIcons">
              <AppstoreOutlined /> Обычные значки
            </Option>
            <Option value="smallIcons">
              <AppstoreAddOutlined /> Маленькие значки
            </Option>
            <Option value="tile">
              <BlockOutlined /> Плитка
            </Option>
            <Option value="content">
              <FileTextOutlined /> Содержимое
            </Option>
          </Select>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={styles.filterButton}
          >
            {showAdvancedFilters ? 'Скрыть фильтры' : 'Расширенные фильтры'}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className={styles.exportButton}
          >
            <DownloadOutlined /> Экспорт
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.createButton}
          >
            <PlusOutlined /> Создать заказ
          </button>
          <button onClick={toggleMassActions} className={styles.massActionsButton}>
            {showMassActions ? 'Скрыть массовые операции' : 'Массовые операции'}
          </button>
          <button
            onClick={() => setShowColumnSettings(true)}
            className={styles.columnSettingsButton}
          >
            <SettingOutlined /> Настройки колонок
          </button>
        </div>
      </div>

      {/* Панель управления сортировкой */}
      <div className={styles.currentSortInfo}>
        <span>Сортировка:</span>
        <Select
          value={sortField}
          onChange={(value) => handleSort(value as keyof OrderType)}
          className={styles.sortSelect}
          title='Сортировка'
          dropdownClassName={styles.antSelectDropdown}
          optionRender={(option) => (
            <div className={styles.antSelectItem}>{option.label}</div>
          )}
        >
          <Option value="createdAt">Дата создания</Option>
          <Option value="updatedAt">Дата обновления</Option>
          <Option value="name">Имя</Option>
          <Option value="amount">Сумма</Option>
          <Option value="status">Статус</Option>
          <Option value="deadline">Дедлайн</Option>
        </Select>
        <button
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          className={`${styles.sortDirectionButton} ${styles.active}`}
        >
          {sortDirection === 'asc' ? '↑ Возрастание' : '↓ Убывание'}
        </button>
      </div>

      {/* Панель массовых операций */}
      {showMassActions && (
        <div className={styles.massActionsPanel}>
          <div className={styles.massActionsButtons}>
            <Select
              value={massStatus}
              onChange={(value) => setMassStatus(value as OrderType['status'])}
              className={styles.massStatusSelect}
              dropdownClassName={styles.antSelectDropdown}
              optionRender={(option) => (
                <div className={styles.antSelectItem}>{option.label}</div>
              )}
            >
              <Option value="NEW">Новый</Option>
              <Option value="IN_PROGRESS">В работе</Option>
              <Option value="COMPLETED">Завершен</Option>
              <Option value="CANCELLED">Отменен</Option>
            </Select>
            <button
              onClick={() => handleMassStatusChange()}
              disabled={selectedOrders.length === 0}
              className={styles.massStatusButton}
            >
              Изменить статус
            </button>
            <button
              onClick={() => setShowMassDeleteConfirm(true)}
              disabled={selectedOrders.length === 0}
              className={styles.massDeleteButton}
            >
              Удалить выбранные
            </button>
            <button
              onClick={copyContactData}
              disabled={selectedOrders.length === 0}
              className={styles.copyContactsButton}
            >
              Копировать контакты
            </button>
            <button onClick={handleSelectAll} className={styles.copyContactsButton}>
              {selectedOrders.length === filteredOrders.length
                ? 'Снять все'
                : 'Выбрать все'}
            </button>
          </div>
        </div>
      )}

      {/* Расширенные фильтры */}
      {showAdvancedFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filterSection}>
            <h3>Фильтр по дате создания</h3>
            <div className={styles.dateRange}>
              <input
                type="date"
                value={localDateRange.startDate}
                onChange={(e) =>
                  setLocalDateRange({ ...localDateRange, startDate: e.target.value })
                }
                className={styles.dateInput}
              />
              <span className={styles.dateSeparator}>—</span>
              <input
                type="date"
                value={localDateRange.endDate}
                onChange={(e) =>
                  setLocalDateRange({ ...localDateRange, endDate: e.target.value })
                }
                className={styles.dateInput}
              />
              <button onClick={handleApplyDateRange} className={styles.applyButton}>
                Применить
              </button>
              <button onClick={handleClearDateRange} className={styles.clearSmallButton}>
                ×
              </button>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3>Фильтр по сумме</h3>
            <div className={styles.amountRange}>
              <input
                type="number"
                placeholder="Мин. сумма"
                value={localAmountRange.minAmount}
                onChange={(e) =>
                  setLocalAmountRange({ ...localAmountRange, minAmount: e.target.value })
                }
                className={styles.amountInput}
              />
              <span className={styles.rangeSeparator}>—</span>
              <input
                type="number"
                placeholder="Макс. сумма"
                value={localAmountRange.maxAmount}
                onChange={(e) =>
                  setLocalAmountRange({ ...localAmountRange, maxAmount: e.target.value })
                }
                className={styles.amountInput}
              />
              <button onClick={handleApplyAmountRange} className={styles.applyButton}>
                Применить
              </button>
              <button
                onClick={handleClearAmountRange}
                className={styles.clearSmallButton}
              >
                ×
              </button>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3>Фильтр по статусам (мультиселект)</h3>
            <div className={styles.statusFilters}>
              {statusOptions.map((option) => (
                <label key={option.value} className={styles.statusCheckbox}>
                  <input
                    type="checkbox"
                    checked={localSelectedStatuses.includes(option.value)}
                    onChange={() => handleStatusToggle(option.value)}
                  />
                  {option.label}
                </label>
              ))}
              <button
                onClick={handleClearStatusFilter}
                className={styles.clearSmallButton}
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div
        className={`${styles.ordersList} ${
          viewMode === 'largeIcons'
            ? styles.largeIconsView
            : viewMode === 'mediumIcons'
            ? styles.mediumIconsView
            : viewMode === 'smallIcons'
            ? styles.smallIconsView
            : viewMode === 'tile'
            ? styles.tileView
            : viewMode === 'content'
            ? styles.contentView
            : styles.listView
        }`}
      >
        {filteredOrders.length === 0 ? (
          <div className={styles.empty}>
            {searchQuery || statusFilter ? 'Заказы не найдены' : 'Заказов нет'}
          </div>
        ) : (
          sortedOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div
                style={{ display: showMassActions ? 'flex' : 'none' }}
                className={styles.orderCheckbox}
              >
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => handleOrderSelect(order.id)}
                  className={styles.checkboxInput}
                />
              </div>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderName}>{order.name}</h3>
                  <a
                    className={styles.orderPhone}
                    href={`tel:${order.phone.replace(/\D/g, '')}`}
                    target="_blank"
                  >
                    {formatPhoneNumber(order.phone)}
                  </a>
                  {(viewMode === 'list' ||
                    viewMode === 'largeIcons' ||
                    viewMode === 'mediumIcons' ||
                    viewMode === 'content') &&
                    order.email && (
                      <a
                        href={`mailto:${order.email}`}
                        className={styles.orderEmail}
                        target="_blank"
                      >
                        {order.email}
                      </a>
                    )}
                  {(viewMode === 'list' ||
                    viewMode === 'largeIcons' ||
                    viewMode === 'mediumIcons' ||
                    viewMode === 'smallIcons' ||
                    viewMode === 'content') && (
                    <div className={styles.socialLinks}>
                      {order.whatsapp && (
                        <a
                          href={`https://wa.me/${order.whatsapp
                            .replace(/^8/, '7')
                            .replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                        >
                          <img
                            src="/whatsapp-icon.svg"
                            alt="WhatsApp"
                            className={styles.socialIcon}
                          />
                        </a>
                      )}
                      {order.telegram && (
                        <a
                          href={`https://t.me/${order.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                        >
                          <img
                            src="/telegram-icon.svg"
                            alt="Telegram"
                            className={styles.socialIcon}
                          />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {order.address &&
                  (viewMode === 'list' ||
                    viewMode === 'largeIcons' ||
                    viewMode === 'content') && (
                    <div className={styles.orderAddress}><EnvironmentOutlined /> {order.address}
                    </div>
                  )}
                <div className={styles.orderStatus}>
                  <Select
                    value={order.status}
                    onChange={(value) =>
                      handleStatusChange(order.id, value as OrderType['status'])
                    }
                    className={styles.statusSelect}
                    style={{ borderColor: getStatusColor(order.status) }}
                    dropdownClassName={styles.antSelectDropdown}
                    optionRender={(option) => (
                      <div className={styles.antSelectItem}>{option.label}</div>
                    )}
                  >
                    <Option value="NEW">Новый</Option>
                    <Option value="IN_PROGRESS">В работе</Option>
                    <Option value="COMPLETED">Завершен</Option>
                    <Option value="CANCELLED">Отменен</Option>
                  </Select>
                </div>
              </div>

              {(viewMode === 'list' ||
                viewMode === 'largeIcons' ||
                viewMode === 'mediumIcons' ||
                viewMode === 'tile') &&
                columnSettings.message &&
                order.message && (
                  <div className={styles.orderMessage}>
                    <strong>Сообщение:</strong> {order.message}
                  </div>
                )}

              {(viewMode === 'list' || viewMode === 'content') && (
                <div className={styles.orderDetails}>
                  {columnSettings.amount && (
                    <div className={styles.detailItem}>
                      <strong>Сумма:</strong>{' '}
                      {order.amount ? `${order.amount} ₽` : 'Не указана'}
                    </div>
                  )}
                  {columnSettings.notes && order.notes && (
                    <div className={styles.detailItem}>
                      <strong>Заметки:</strong> {order.notes}
                    </div>
                  )}
                  {columnSettings.createdAt && (
                    <div className={styles.detailItem}>
                      <strong>Создан:</strong>{' '}
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </div>
                  )}
                  {columnSettings.updatedAt && (
                    <div className={styles.detailItem}>
                      <strong>Обновлен:</strong>{' '}
                      {new Date(order.updatedAt).toLocaleString('ru-RU')}
                    </div>
                  )}
                  {columnSettings.deadline && order.deadline && (
                    <div className={styles.detailItem}>
                      <strong>Дедлайн:</strong>{' '}
                      {new Date(order.deadline).toLocaleString('ru-RU')}
                    </div>
                  )}
                  {columnSettings.personalData && (
                    <div className={styles.detailItem}>
                      <strong>Согласие на обработку данных:</strong>{' '}
                      {order.personalData ? 'Да' : 'Нет'}
                    </div>
                  )}
                  {columnSettings.oferta && (
                    <div className={styles.detailItem}>
                      <strong>Принятие оферты:</strong> {order.oferta ? 'Да' : 'Нет'}
                    </div>
                  )}
                  {columnSettings.mailing && (
                    <div className={styles.detailItem}>
                      <strong>Согласие на рассылку:</strong>{' '}
                      {order.mailing ? 'Да' : 'Нет'}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.orderActions}>
                <button
                  onClick={() => handleEditOrder(order)}
                  className={styles.editButton}
                >
                  Редактировать
                </button>
                <button
                  onClick={() => {
                    setOrderToDelete(order.id);
                    setShowDeleteConfirm(true);
                  }}
                  className={styles.deleteButton}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}

        {/* Модальное окно создания заказа */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Создание нового заказа</h2>
              {createError && <div className={styles.error}>{createError}</div>}
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label>Имя *</label>
                  <input
                    type="text"
                    value={newOrder.name}
                    onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                    className={styles.formInput}
                    placeholder="Введите имя клиента"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                    className={styles.formInput}
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={newOrder.email}
                    onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                    className={styles.formInput}
                    placeholder="email@example.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Сообщение</label>
                  <textarea
                    value={newOrder.message}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, message: e.target.value })
                    }
                    className={styles.formTextarea}
                    placeholder="Сообщение от клиента"
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Статус</label>
                  <Select
                    value={newOrder.status}
                    onChange={(value) =>
                      setNewOrder({
                        ...newOrder,
                        status: value as OrderType['status'],
                      })
                    }
                    className={styles.formInput}
                    dropdownClassName={styles.antSelectDropdown}
                    optionRender={(option) => (
                      <div className={styles.antSelectItem}>{option.label}</div>
                    )}
                  >
                    <Option value="NEW">Новый</Option>
                    <Option value="IN_PROGRESS">В работе</Option>
                    <Option value="COMPLETED">Завершен</Option>
                    <Option value="CANCELLED">Отменен</Option>
                  </Select>
                </div>
                <div className={styles.formGroup}>
                  <label>Сумма заказа</label>
                  <input
                    type="number"
                    value={newOrder.amount}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, amount: Number(e.target.value) })
                    }
                    className={styles.formInput}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>WhatsApp</label>
                  <input
                    type="url"
                    value={newOrder.whatsapp}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, whatsapp: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="https://wa.me/79999999999"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Telegram</label>
                  <input
                    type="url"
                    value={newOrder.telegram}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, telegram: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="https://t.me/username"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Адрес</label>
                  <input
                    type="text"
                    value={newOrder.address}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, address: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Введите адрес клиента"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Дедлайн</label>
                  <input
                    type="datetime-local"
                    value={newOrder.deadline}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, deadline: e.target.value })
                    }
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Заметки</label>
                  <textarea
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                    className={styles.formTextarea}
                    placeholder="Дополнительные заметки"
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newOrder.personalData}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, personalData: e.target.checked })
                      }
                    />
                    Согласие на обработку персональных данных
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newOrder.oferta}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, oferta: e.target.checked })
                      }
                    />
                    Принятие оферты
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newOrder.mailing}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, mailing: e.target.checked })
                      }
                    />
                    Согласие на рассылку
                  </label>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button onClick={handleCreateOrder} className={styles.saveButton}>
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                    setNewOrder({
                      name: '',
                      email: '',
                      phone: '',
                      message: '',
                      personalData: false,
                      oferta: false,
                      mailing: false,
                      status: 'NEW',
                      amount: 0,
                      notes: '',
                      whatsapp: '',
                      telegram: '',
                      address: '',
                      deadline: '',
                    });
                  }}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      {showEditModal && editingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Редактирование заказа</h2>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Имя:</label>
                <input
                  type="text"
                  value={editingOrder?.name || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Телефон:</label>
                <input
                  type="tel"
                  value={editingOrder?.phone || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            phone: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editingOrder?.email || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            email: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Сообщение:</label>
                <textarea
                  value={editingOrder?.message || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            message: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Статус:</label>
                <Select
                  value={editingOrder?.status || 'NEW'}
                  onChange={(value) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: value as OrderType['status'],
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                  dropdownClassName={styles.antSelectDropdown}
                  optionRender={(option) => (
                    <div className={styles.antSelectItem}>{option.label}</div>
                  )}
                >
                  <Option value="NEW">Новый</Option>
                  <Option value="IN_PROGRESS">В работе</Option>
                  <Option value="COMPLETED">Завершен</Option>
                  <Option value="CANCELLED">Отменен</Option>
                </Select>
              </div>
              <div className={styles.formGroup}>
                <label>Сумма заказа:</label>
                <input
                  type="number"
                  value={editingOrder?.amount?.toString() || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            amount: e.target.value ? Number(e.target.value) : null,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>WhatsApp:</label>
                <input
                  type="url"
                  value={editingOrder?.whatsapp || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            whatsapp: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                  placeholder="https://wa.me/79999999999"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Telegram:</label>
                <input
                  type="url"
                  value={editingOrder?.telegram || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            telegram: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                  placeholder="https://t.me/username"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Адрес:</label>
                <input
                  type="text"
                  value={editingOrder?.address || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                  placeholder="Введите адрес клиента"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Дедлайн:</label>
                <input
                  type="datetime-local"
                  value={editingOrder?.deadline || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            deadline: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Заметки:</label>
                <textarea
                  value={editingOrder?.notes || ''}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            notes: e.target.value,
                          }
                        : null,
                    )
                  }
                  className={styles.formTextarea}
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingOrder?.personalData || false}
                    onChange={(e) =>
                      setEditingOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              personalData: e.target.checked,
                            }
                          : null,
                      )
                    }
                  />
                  Согласие на обработку персональных данных
                </label>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingOrder?.oferta || false}
                    onChange={(e) =>
                      setEditingOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              oferta: e.target.checked,
                            }
                          : null,
                      )
                    }
                  />
                  Принятие оферты
                </label>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingOrder?.mailing || false}
                    onChange={(e) =>
                      setEditingOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              mailing: e.target.checked,
                            }
                          : null,
                      )
                    }
                  />
                  Согласие на рассылку
                </label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveEdit} className={styles.saveButton}>
                Сохранить
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                }}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно экспорта */}
      {showExportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Экспорт данных</h2>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Формат экспорта</label>
                <Select
                  value={exportFormat}
                  onChange={(value) => setExportFormat(value as 'xlsx')}
                  className={styles.formInput}
                  dropdownClassName={styles.antSelectDropdown}
                  optionRender={(option) => (
                    <div className={styles.antSelectItem}>{option.label}</div>
                  )}
                >
                  <Option value="xlsx">Excel (.xlsx)</Option>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <label>Выберите поля для экспорта</label>
                <div className={styles.exportFields}>
                  <div className={styles.fieldActions}>
                    <button
                      onClick={selectAllExportFields}
                      className={styles.smallButton}
                    >
                      Выбрать все
                    </button>
                    <button onClick={resetExportFields} className={styles.smallButton}>
                      Сбросить
                    </button>
                  </div>
                  <div className={styles.fieldsList}>
                    {availableFields.map((field) => (
                      <label key={field.value} className={styles.exportCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedExportFields.includes(field.value)}
                          onChange={() => toggleExportField(field.value)}
                        />
                        {field.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleExport} className={styles.saveButton}>
                Экспортировать
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Подтверждение удаления</h2>
            <p>Вы уверены, что хотите удалить этот заказ?</p>
            <div className={styles.modalActions}>
              <button onClick={handleDeleteOrder} className={styles.deleteButton}>
                Удалить
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения массового удаления */}
      {showMassDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Подтверждение массового удаления</h2>
            <p>
              Вы уверены, что хотите удалить {selectedOrders.length} выбранных заказов?
            </p>
            <div className={styles.modalActions}>
              <button onClick={handleMassDelete} className={styles.deleteButton}>
                Удалить ({selectedOrders.length})
              </button>
              <button
                onClick={() => {
                  setShowMassDeleteConfirm(false);
                }}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно настроек колонок */}
      {showColumnSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.columnSettingsModal}>
            <h2>Настройка отображаемых колонок</h2>
            <div className={styles.columnSettingsList}>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.name}
                  onChange={() => toggleColumnSetting('name')}
                />
                <span className={styles.columnSettingLabel}>Имя</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.phone}
                  onChange={() => toggleColumnSetting('phone')}
                />
                <span className={styles.columnSettingLabel}>Телефон</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.email}
                  onChange={() => toggleColumnSetting('email')}
                />
                <span className={styles.columnSettingLabel}>Email</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.message}
                  onChange={() => toggleColumnSetting('message')}
                />
                <span className={styles.columnSettingLabel}>Сообщение</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.status}
                  onChange={() => toggleColumnSetting('status')}
                />
                <span className={styles.columnSettingLabel}>Статус</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.amount}
                  onChange={() => toggleColumnSetting('amount')}
                />
                <span className={styles.columnSettingLabel}>Сумма</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.notes}
                  onChange={() => toggleColumnSetting('notes')}
                />
                <span className={styles.columnSettingLabel}>Заметки</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.whatsapp}
                  onChange={() => toggleColumnSetting('whatsapp')}
                />
                <span className={styles.columnSettingLabel}>WhatsApp</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.telegram}
                  onChange={() => toggleColumnSetting('telegram')}
                />
                <span className={styles.columnSettingLabel}>Telegram</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.address}
                  onChange={() => toggleColumnSetting('address')}
                />
                <span className={styles.columnSettingLabel}>Адрес</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.deadline}
                  onChange={() => toggleColumnSetting('deadline')}
                />
                <span className={styles.columnSettingLabel}>Дедлайн</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.personalData}
                  onChange={() => toggleColumnSetting('personalData')}
                />
                <span className={styles.columnSettingLabel}>
                  Согласие на обработку данных
                </span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.oferta}
                  onChange={() => toggleColumnSetting('oferta')}
                />
                <span className={styles.columnSettingLabel}>Принятие оферты</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.mailing}
                  onChange={() => toggleColumnSetting('mailing')}
                />
                <span className={styles.columnSettingLabel}>Согласие на рассылку</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.createdAt}
                  onChange={() => toggleColumnSetting('createdAt')}
                />
                <span className={styles.columnSettingLabel}>Дата создания</span>
              </div>
              <div className={styles.columnSettingItem}>
                <input
                  type="checkbox"
                  checked={columnSettings.updatedAt}
                  onChange={() => toggleColumnSetting('updatedAt')}
                />
                <span className={styles.columnSettingLabel}>Дата обновления</span>
              </div>
            </div>
            <div className={styles.columnSettingsActions}>
              <button
                onClick={resetColumnSettings}
                className={styles.resetSettingsButton}
              >
                Сбросить настройки
              </button>
              <button onClick={saveColumnSettings} className={styles.saveSettingsButton}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

