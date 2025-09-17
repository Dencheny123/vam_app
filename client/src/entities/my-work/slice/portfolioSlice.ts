import { createSlice } from '@reduxjs/toolkit';
import {
  createMyWork,
  getAllMyWorks,
  getMyWorkById,
  updateMyWork,
  deleteMyWork,
} from '../api/portfolio';
import { MyWorkState } from '../model';

const initialState: MyWorkState = {
  works: [],
  currentWork: null,
  loading: false,
  error: null,
};

const myWorkSlice = createSlice({
  name: 'myWork',
  initialState,
  reducers: {
    clearCurrentWork: (state) => {
      state.currentWork = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createMyWork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMyWork.fulfilled, (state, action) => {
        state.loading = false;
        state.works.push(action.payload);
      })
      .addCase(createMyWork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string }).message || 'Ошибка при создании работы'
          : 'Ошибка при создании работы';
      })

      // Get All
      .addCase(getAllMyWorks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMyWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload;
      })
      .addCase(getAllMyWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string }).message || 'Ошибка при получении работ'
          : 'Ошибка при получении работ';
      })

      // Get By Id
      .addCase(getMyWorkById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyWorkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWork = action.payload;
      })
      .addCase(getMyWorkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string }).message || 'Ошибка при получении работы'
          : 'Ошибка при получении работы';
      })

      // Update
      .addCase(updateMyWork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyWork.fulfilled, (state, action) => {
        state.loading = false;
        state.works = state.works.map((work) =>
          work.id === action.payload.id ? action.payload : work,
        );
        if (state.currentWork?.id === action.payload.id) {
          state.currentWork = action.payload;
        }
      })
      .addCase(updateMyWork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string }).message || 'Ошибка при обновлении работы'
          : 'Ошибка при обновлении работы';
      })

      // Delete
      .addCase(deleteMyWork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMyWork.fulfilled, (state, action) => {
        state.loading = false;
        state.works = state.works.filter((work) => work.id !== action.payload.id);
        if (state.currentWork?.id === action.payload.id) {
          state.currentWork = null;
        }
      })
      .addCase(deleteMyWork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string }).message || 'Ошибка при удалении работы'
          : 'Ошибка при удалении работы';
      });
  },
});

export const { clearCurrentWork } = myWorkSlice.actions;
export const myWorkReducer = myWorkSlice.reducer;