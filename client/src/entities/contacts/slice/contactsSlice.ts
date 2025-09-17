import { createSlice } from '@reduxjs/toolkit';
import {
  createContactThunk,
  getAllContactsThunk,
  getContactByIdThunk,
  updateContactThunk,
  deleteContactThunk,
} from '../api/ContactsApi';
import { initialContactState } from '../model';

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: initialContactState,
  reducers: {},
  extraReducers: (builder) =>
    builder
  
    //& ПОЛУЧИТЬ ВСЕХ-------------------------------------------------

      .addCase(getAllContactsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllContactsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload;
        state.isInitialized = true;
      })
      .addCase(getAllContactsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error ?? null;
        state.isInitialized = true;
      })

      //& ПОЛУЧИТЬ ОДНОГО-------------------------------------------------

      .addCase(getContactByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentContact = null;
      })
      .addCase(getContactByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentContact = action.payload;
      })
      .addCase(getContactByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error ?? null;
      })

      //& СОЗДАНИЕ-------------------------------------------------

      .addCase(createContactThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContactThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.contacts) {
          state.contacts.push(action.payload);
        } else {
          state.contacts = [action.payload];
        }
      })
      .addCase(createContactThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error ?? null;
      })

      //& ОБНОВЛЕНИЕ-------------------------------------------------

      .addCase(updateContactThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContactThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.contacts) {
          state.contacts = state.contacts.map(contact =>
            contact.id === action.payload.id ? action.payload : contact
          );
        }
        if (state.currentContact?.id === action.payload.id) {
          state.currentContact = action.payload;
        }
      })
      .addCase(updateContactThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error ?? null;
      })

      //& УДАЛЕНИЕ-------------------------------------------------

      .addCase(deleteContactThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContactThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.contacts) {
          state.contacts = state.contacts.filter(
            contact => contact.id !== action.payload
          );
        }
        if (state.currentContact?.id === action.payload) {
          state.currentContact = null;
        }
      })
      .addCase(deleteContactThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error ?? null;
      }),
});

export const { actions: contactsActions } = contactsSlice
export const contactsReducer = contactsSlice.reducer;