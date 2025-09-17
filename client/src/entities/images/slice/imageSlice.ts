import { createSlice } from '@reduxjs/toolkit';
import { getAllImages, uploadImage, deleteImage } from '../api/imageThunkApi';
import { ImageState } from '../model/imageTypes';

const initialState: ImageState = {
  images: [],
  loading: false,
  error: null,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    clearImageState(state) {
      state.images = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(getAllImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Произошла ошибка';
      })
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.error = null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Произошла ошибка';
      })
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter(
          (image) => image.filename !== action.meta.arg,
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Произошла ошибка';
      });
  },
});

export const { actions: imageActions } = imageSlice;
export const { clearImageState } = imageSlice.actions;
export const imageReducer = imageSlice.reducer;