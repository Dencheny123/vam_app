import { createSlice } from '@reduxjs/toolkit';
import { getAllMetaData, getOneMetaData, updateMetaData } from '../api/metaDataThunkApi';
import { IMetaData } from '../model/metaDataTypes';

export type MetaDataType = {
  metaData: IMetaData | null;
  metaDatas: IMetaData[] | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: MetaDataType = {
  metaData: null,
  metaDatas: [],
  isLoading: false,
  error: null,
};

const metaDataSlice = createSlice({
  name: 'metaData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllMetaData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllMetaData.fulfilled, (state, action) => {
        state.isLoading = false;
        // Проверяем структуру ответа
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.metaDatas = action.payload.data;
        } else {
          state.error = 'Неверный формат полученных данных';
          console.error('Invalid meta data format:', action.payload);
        }
      })
      .addCase(getAllMetaData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Ошибка при получении метаданных';
      })

      .addCase(getOneMetaData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOneMetaData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.metaData = action.payload.data;
        } else {
          state.error = 'Неверный формат полученных данных';
          console.error('Invalid single meta data format:', action.payload);
        }
      })
      .addCase(getOneMetaData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Ошибка при получении метаданных';
      })

      .addCase(updateMetaData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMetaData.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload;
        
        // Проверяем структуру ответа - данные могут быть напрямую в payload или в payload.data
        const updatedData = response.data || response;

        if (!updatedData) {
          const errorMsg = 'Received invalid metadata format from server';
          state.error = errorMsg;
          console.error(errorMsg, {
            payload: action.payload,
            responseData: response,
          });
          return;
        }

        // Обновляем metaDatas
        if (state.metaDatas) {
          state.metaDatas = state.metaDatas.map((item) =>
            item.id === updatedData.id ? { ...item, ...updatedData } : item,
          );
        }
        
        // Обновляем текущий metaData
        if (state.metaData?.id === updatedData.id) {
          state.metaData = { ...state.metaData, ...updatedData };
        }
      })
      .addCase(updateMetaData.rejected, (state, action: { payload: any }) => {
        state.isLoading = false;
        state.error = action.payload.message || 'Ошибка при обновлении метаданных';
      });
  },
});

export const { actions: metaDataActions } = metaDataSlice;
export const metaDataReducer = metaDataSlice.reducer;
