import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { ContactDataType, ContactType } from '../model';
import { handleAxiosError } from '@/shared/utils/handleAxiosError';
import type { ServerResponseType } from '@/shared/types';

enum CONTACTS_THUNK_TYPES {
  CREATE_CONTACT = 'contacts/createContact',
  GET_ALL_CONTACTS = 'contacts/getAllContacts',
  GET_CONTACT_BY_ID = 'contacts/getContactById',
  UPDATE_CONTACT = 'contacts/updateContact',
  DELETE_CONTACT = 'contacts/deleteContact',
}

enum CONTACTS_API_URLS {
  BASE = 'contacts',
  WITH_ID = 'contacts/:id',
}

//& СОЗДАНИЕ-------------------------------------------------

export const createContactThunk = createAsyncThunk<
  ContactType,
  ContactDataType,
  { rejectValue: ServerResponseType<null> }
>(CONTACTS_THUNK_TYPES.CREATE_CONTACT, async (contactData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<ServerResponseType<ContactType>>(
      CONTACTS_API_URLS.BASE,
      contactData,
    );
    return data.data;
  } catch (error) {
    return rejectWithValue(handleAxiosError(error));
  }
});

//& ПОЛУЧИТЬ ВСЕХ-------------------------------------------------

export const getAllContactsThunk = createAsyncThunk<
  ContactType[],
  void,
  { rejectValue: ServerResponseType<null> }
>(CONTACTS_THUNK_TYPES.GET_ALL_CONTACTS, async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ServerResponseType<ContactType[]>>(
      CONTACTS_API_URLS.BASE,
    );
    return data.data;
  } catch (error) {
    return rejectWithValue(handleAxiosError(error));
  }
});

//& ПОЛУЧИТЬ ОДНОГО-------------------------------------------------

export const getContactByIdThunk = createAsyncThunk<
  ContactType,
  number,
  { rejectValue: ServerResponseType<null> }
>(CONTACTS_THUNK_TYPES.GET_CONTACT_BY_ID, async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ServerResponseType<ContactType>>(
      CONTACTS_API_URLS.WITH_ID.replace(':id', id.toString()),
    );
    return data.data;
  } catch (error) {
    return rejectWithValue(handleAxiosError(error));
  }
});

//& ОБНОВЛЕНИЕ-------------------------------------------------

export const updateContactThunk = createAsyncThunk<
  ContactType,
  { id: number; data: ContactDataType },
  { rejectValue: ServerResponseType<null> }
>(
  CONTACTS_THUNK_TYPES.UPDATE_CONTACT,
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: responseData } = await axiosInstance.put<ServerResponseType<ContactType>>(
        CONTACTS_API_URLS.WITH_ID.replace(':id', id.toString()),
        data,
      );
      return responseData.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

//& УДАЛЕНИЕ-------------------------------------------------

export const deleteContactThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: ServerResponseType<null> }
>(CONTACTS_THUNK_TYPES.DELETE_CONTACT, async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete<ServerResponseType<null>>(
      CONTACTS_API_URLS.WITH_ID.replace(':id', id.toString()),
    );
    return id;
  } catch (error) {
    return rejectWithValue(handleAxiosError(error));
  }
});