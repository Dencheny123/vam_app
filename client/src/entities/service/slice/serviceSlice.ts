import { createSlice } from '@reduxjs/toolkit';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from '../api/serviceThunkApi';
import { ServiceState } from '../model/serviceTypes';

const initialState: ServiceState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
  imageLoading: false,
};

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    clearCurrentService: (state) => {
      state.currentService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createService.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.services.push(payload);
      })

      // Get All
      .addCase(getAllServices.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.services = payload;
      })

      // Get By Id
      .addCase(getServiceById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentService = payload;
      })

      // Update
      .addCase(updateService.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.services = state.services.map((service) =>
          service.id === payload.id ? payload : service,
        );
        state.currentService = payload;
      })

      // Delete
      .addCase(deleteService.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.services = state.services.filter((service) => service.id !== payload.id);
        if (state.currentService?.id === payload.id) {
          state.currentService = null;
        }
      });
  },
});

export const { clearCurrentService } = serviceSlice.actions;
export const serviceReducer = serviceSlice.reducer;
