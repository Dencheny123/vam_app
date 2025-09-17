import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { ServerResponseType } from '@/shared/types';
import { IMetaData, IMetaDataInput } from '../model/metaDataTypes';
import { METADATA_TYPES } from '@/shared/enums/metaDataThunkTypes';
import { METADATA_API_ROUTES } from '@/shared/enums/metaDataApiRoutes';

export const getAllMetaData = createAsyncThunk<
  ServerResponseType<IMetaData[]>,
  void,
  { rejectValue: ServerResponseType<null> }
>(METADATA_TYPES.ALL_METADATA, async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ServerResponseType<IMetaData[]>>(
      METADATA_API_ROUTES.METADATA,
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    console.error('getAllMetaData error:', err.response?.data);
    return rejectWithValue(
      err.response?.data || {
        statusCode: 500,
        message: 'Ошибка получения METADATA',
        data: null,
        error: err.message || 'Unknown error',
      },
    );
  }
});

export const getOneMetaData = createAsyncThunk<
  ServerResponseType<IMetaData>,
  string,
  { rejectValue: ServerResponseType<null> }
>(METADATA_TYPES.ONE_METADATA, async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ServerResponseType<IMetaData>>(
      `${METADATA_API_ROUTES.METADATA}/${id}`,
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    console.error('getAllMetaData error:', err.response?.data);
    return rejectWithValue(
      err.response?.data || {
        statusCode: 500,
        message: 'Ошибка получения METADATA',
        data: null,
        error: err.message || 'Unknown error',
      },
    );
  }
});

export const updateMetaData = createAsyncThunk<
  ServerResponseType<IMetaData>,
  { id: number; data: Partial<IMetaDataInput>; files?: { [key: string]: File } },
  { rejectValue: ServerResponseType<null> }
>(METADATA_TYPES.UPDATE_METADATA, async ({ id, data, files }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    // Добавляем текстовые поля
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    // Добавляем файлы
    if (files) {
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });
    }

    const { data: responseData } = await axiosInstance.put<ServerResponseType<IMetaData>>(
      `${METADATA_API_ROUTES.METADATA}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return responseData;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    console.error('updateMetaData error - full error:', error);
    console.error('updateMetaData error - response:', err.response);
    console.error('updateMetaData error - response data:', err.response?.data);
    console.error('updateMetaData error - message:', err.message);
    
    return rejectWithValue(
      err.response?.data || {
        statusCode: 500,
        message: 'Ошибка обновления METADATA',
        data: null,
        error: err.message || 'Unknown error',
      },
    );
  }
});
