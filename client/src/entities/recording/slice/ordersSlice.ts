import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderType, OrdersState } from '../model/index';
import { getOrdersThunk, updateOrderThunk, deleteOrderThunk, createOrderThunk, updateOrdersStatusThunk, deleteOrdersThunk } from '../api/RecordingFormApi';

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  searchQuery: '',
  statusFilter: '',
  dateRangeFilter: {
    startDate: '',
    endDate: ''
  },
  amountRangeFilter: {
    minAmount: null,
    maxAmount: null
  },
  selectedStatuses: []
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<OrderType[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<OrderType>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<OrderType>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<number>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setDateRangeFilter: (state, action: PayloadAction<{startDate: string; endDate: string}>) => {
      state.dateRangeFilter = action.payload;
    },
    setAmountRangeFilter: (state, action: PayloadAction<{minAmount: number | null; maxAmount: number | null}>) => {
      state.amountRangeFilter = action.payload;
    },
    setSelectedStatuses: (state, action: PayloadAction<string[]>) => {
      state.selectedStatuses = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = '';
      state.dateRangeFilter = {
        startDate: '',
        endDate: ''
      };
      state.amountRangeFilter = {
        minAmount: null,
        maxAmount: null
      };
      state.selectedStatuses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // getOrdersThunk
      .addCase(getOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка загрузки заказов';
      })
      // updateOrderThunk
      .addCase(updateOrderThunk.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          // Обновляем все поля заказа, включая amount и notes
          state.orders[index] = {
            ...state.orders[index],
            ...action.payload,
            // Убеждаемся, что числовые поля обрабатываются правильно
            amount: action.payload.amount !== null ? Number(action.payload.amount) : null,
            // Обновляем все остальные поля
            name: action.payload.name,
            email: action.payload.email,
            phone: action.payload.phone,
            message: action.payload.message,
            status: action.payload.status,
            notes: action.payload.notes,
            whatsapp: action.payload.whatsapp,
            telegram: action.payload.telegram,
            address: action.payload.address,
            personalData: Boolean(action.payload.personalData),
            oferta: Boolean(action.payload.oferta),
            mailing: Boolean(action.payload.mailing),
            createdAt: action.payload.createdAt,
            updatedAt: action.payload.updatedAt
          };
        }
      })
      .addCase(updateOrderThunk.rejected, (state, action) => {
        state.error = action.payload?.error || 'Ошибка обновления заказа';
      })
      // deleteOrderThunk
      .addCase(deleteOrderThunk.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order.id !== action.meta.arg);
      })
      .addCase(deleteOrderThunk.rejected, (state, action) => {
        state.error = action.payload?.error || 'Ошибка удаления заказа';
      })
      // createOrderThunk
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Ошибка создания заказа';
      })
      // updateOrdersStatusThunk
      .addCase(updateOrdersStatusThunk.fulfilled, (state, action) => {
        action.payload.forEach(updatedOrder => {
          const index = state.orders.findIndex(order => order.id === updatedOrder.id);
          if (index !== -1) {
            state.orders[index].status = updatedOrder.status;
          }
        });
      })
      .addCase(updateOrdersStatusThunk.rejected, (state, action) => {
        state.error = action.payload?.error || 'Ошибка массового обновления статусов';
      })
      // deleteOrdersThunk
      .addCase(deleteOrdersThunk.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => !action.payload.deletedIds.includes(order.id));
      })
      .addCase(deleteOrdersThunk.rejected, (state, action) => {
        state.error = action.payload?.error || 'Ошибка массового удаления';
      });
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setLoading,
  setError,
  setSearchQuery,
  setStatusFilter,
  setDateRangeFilter,
  setAmountRangeFilter,
  setSelectedStatuses,
  clearFilters,
} = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;