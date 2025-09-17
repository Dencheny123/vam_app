export interface RecordingFormData {
  name?: string;
  tel: string;
  message?: string;
  personalData?: string | boolean;
  oferta?: string | boolean;
}

export interface OrderType {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  amount: number | null;
  notes: string | null;
  personalData: boolean;
  oferta: boolean;
  mailing: boolean | null;
  whatsapp: string | null;
  telegram: string | null;
  address: string | null;
  deadline: string | null;
  deadlineSetAt: string | null;
  deadlineNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersState {
  orders: OrderType[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
  dateRangeFilter: {
    startDate: string;
    endDate: string;
  };
  amountRangeFilter: {
    minAmount: number | null;
    maxAmount: number | null;
  };
  selectedStatuses: string[];
}