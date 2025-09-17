import { RecordingFormData, OrderType } from '../model/index';
import {
  RECORDINGFORM_API_URLS,
  RECORDINGFORM_THUNK_TYPES,
} from '@/shared/enums/RecordingFormRoutes';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import { ServerResponseType } from '@/shared/types';
import { handleAxiosError } from '@/shared/utils/handleAxiosError';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const sendRecordingThunk = createAsyncThunk<
  ServerResponseType<null>,
  RecordingFormData,
  { rejectValue: ServerResponseType<null> }
>(
  RECORDINGFORM_THUNK_TYPES.RECORDINGFORM,
  async (recordingFormData, { rejectWithValue }) => {
    console.log('Начало выполнения thunk', recordingFormData);
    try {
      console.log('Попытка отправки запроса...');
      const response = await axiosInstance.post<ServerResponseType<null>>(
        RECORDINGFORM_API_URLS.RECORDINGFORM,
        recordingFormData,
      );

      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка в thunk:', error);
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const getOrdersThunk = createAsyncThunk<
  OrderType[],
  void,
  { rejectValue: ServerResponseType<null> }
>(
  'orders/getOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<OrderType[]>(
        `${RECORDINGFORM_API_URLS.RECORDINGFORM}/orders`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const createOrderThunk = createAsyncThunk<
  OrderType,
  {
    name: string;
    email?: string;
    phone: string;
    message?: string;
    personalData: boolean;
    oferta: boolean;
    mailing?: boolean;
    status?: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    amount?: number;
    notes?: string;
    whatsapp?: string;
    telegram?: string;
    address?: string;
    deadline?: string;
  },
  { rejectValue: ServerResponseType<null> }
>(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<OrderType>(
        `${RECORDINGFORM_API_URLS.RECORDINGFORM}/orders`,
        orderData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const updateOrderThunk = createAsyncThunk<
  OrderType,
  { id: number; data: Partial<OrderType> },
  { rejectValue: ServerResponseType<null> }
>(
  'orders/updateOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<OrderType>(
        `${RECORDINGFORM_API_URLS.RECORDINGFORM}/orders/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const deleteOrderThunk = createAsyncThunk<
  { message: string },
  number,
  { rejectValue: ServerResponseType<null> }
>(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<{ message: string }>(
        `${RECORDINGFORM_API_URLS.RECORDINGFORM}/orders/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const updateOrdersStatusThunk = createAsyncThunk<
  OrderType[],
  { ids: number[]; status: OrderType['status'] },
  { rejectValue: ServerResponseType<null> }
>(
  'orders/updateOrdersStatus',
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<OrderType[]>(
        `${RECORDINGFORM_API_URLS.RECORDINGFORM}/orders/bulk/status`,
        { ids, status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const deleteOrdersThunk = createAsyncThunk<
  { message: string; deletedIds: number[] },
  number[],
  { rejectValue: ServerResponseType<null> }
>(
  'orders/deleteOrders',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ message: string; deletedIds: number[] }>(
        `${RECORDINGFORM_API_URLS.RECORDINGFORM}/orders/bulk/delete`,
        { ids }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);
