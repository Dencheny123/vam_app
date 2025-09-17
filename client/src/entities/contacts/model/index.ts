export type ContactDataType = {
  email?: string;
  tel?: string;
  address?: string;
  whatsapp?: string;
  telegram?: string;
};

export type ContactType = {
  id: number;
  email: string | null;
  tel: string | null;
  address: string | null;
  whatsapp: string | null;
  telegram: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactResponseType = {
  message: string;
  statusCode: number;
  error: string | null;
  data: ContactType | ContactType[];
};

export type ContactStateType = {
  contacts: ContactType[] | null;
  currentContact: ContactType | null;
  isInitialized: boolean;
  error: string | null;
  isLoading: boolean;
};

export const initialContactState: ContactStateType = {
  contacts: null,
  currentContact: null,
  isInitialized: false,
  error: null,
  isLoading: false,
};

export type ContactValidatorResponseType = {
  isValid: boolean;
  error: string | null;
};