import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import { ServerResponseType } from '@/shared/types';
import { MyWork } from '../model';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

export const createMyWork = createAsyncThunk(
  'myWork/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<ServerResponseType<MyWork>>(
        '/my-work',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Ошибка при создании работы' },
      );
    }
  },
);

export const getAllMyWorks = createAsyncThunk(
  'myWork/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ServerResponseType<MyWork[]>>('/my-work');
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Ошибка при получении работ' },
      );
    }
  },
);

export const getMyWorkById = createAsyncThunk(
  'myWork/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ServerResponseType<MyWork>>(
        `/my-work/${id}`,
      );
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Ошибка при получении работы' },
      );
    }
  },
);

export const updateMyWork = createAsyncThunk(
  'myWork/update',
  async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put<ServerResponseType<MyWork>>(
        `/my-work/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Ошибка при обновлении работы' },
      );
    }
  },
);

export const deleteMyWork = createAsyncThunk(
  'myWork/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<ServerResponseType<unknown>>(`/my-work/${id}`);
      return { id };
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Ошибка при удалении работы' },
      );
    }
  },
);