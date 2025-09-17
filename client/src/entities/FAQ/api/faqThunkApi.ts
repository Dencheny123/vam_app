import { createAsyncThunk } from '@reduxjs/toolkit';
import { Faq } from '../model/faqTypes';
import { axiosInstance } from '@/shared/lib/axiosInstance';

export const fetchFaqs = createAsyncThunk<Faq[]>(
  'faq/fetchFaqs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ data: Faq[] }>('/faq');
      if (!Array.isArray(response.data.data)) {
        throw new Error('Полученные данные не являются массивом');
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка запроса на FAQ');
    }
  },
);

export const createFaq = createAsyncThunk<Faq, { question?: string; answers?: string }>(
  'faq/createFaq',
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<Faq>('/faq', faqData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка создания FAQ');
    }
  },
);

export const getFaqById = createAsyncThunk<Faq, number>(
  'faq/getFaqById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Faq>(`/faq/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка получения FAQ по id');
    }
  },
);

export const updateFaq = createAsyncThunk<
  Faq,
  { id: number; question?: string; answers?: string }
>('faq/updateFaq', async ({ id, question, answers }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put<{ data: Faq }>(`/faq/${id}`, { question, answers });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Ошибка обновления FAQ');
  }
});

export const deleteFaq = createAsyncThunk<number, number>(
  'faq/deleteFaq',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/faq/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка удаления FAQ');
    }
  },
);
