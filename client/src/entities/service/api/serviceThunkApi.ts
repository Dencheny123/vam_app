import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import { ServerResponseType } from '@/shared/types';
import { Service } from '../model/serviceTypes';
import { AxiosError } from 'axios';

export const handleApiError = (error: AxiosError | any) => {
  return error.response?.data || { message: 'Произошла ошибка при выполнении запроса' };
};

export const createService = createAsyncThunk(
  'service/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<ServerResponseType<Service>>(
        '/service',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const getAllServices = createAsyncThunk(
  'service/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ServerResponseType<Service[]>>('/service');
      return data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const getServiceById = createAsyncThunk(
  'service/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ServerResponseType<Service>>(
        `/service/${id}`
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateService = createAsyncThunk(
  'service/update',
  async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put<ServerResponseType<Service>>(
        `/service/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteService = createAsyncThunk(
  'service/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete<ServerResponseType<Service>>(
        `/service/${id}`
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);