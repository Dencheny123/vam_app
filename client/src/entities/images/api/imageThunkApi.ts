import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { ServerResponseType } from '@/shared/types';
import type { Image } from '../model/imageTypes';
import { handleApiError } from '@/entities/service/api/serviceThunkApi';

export const getAllImages = createAsyncThunk<
  ServerResponseType<Image[]>,
  void,
  { rejectValue: ServerResponseType<null> }
>('images/getAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ServerResponseType<Image[]>>('/images');
    console.log('getAllImages response:', data);
    return data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const uploadImage = createAsyncThunk<
  ServerResponseType<Image[]>,
  FormData,
  { rejectValue: ServerResponseType<null> }
>('images/upload', async (formData: FormData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<ServerResponseType<Image[]>>(
      '/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const deleteImage = createAsyncThunk<
  ServerResponseType<null>,
  string,
  { rejectValue: ServerResponseType<null> }
>('images/delete', async (filename, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete<ServerResponseType<null>>(
      `/images/${filename}`,
    );
    console.log('deleteImage response:', data);
    return data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});
