import {
  userReducer,
  myWorkReducer,
  metaDataReducer,
  faqReducer,
  contactsReducer,
  serviceReducer,
  imageReducer,
  ordersReducer,
} from '@/entities';
import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';

const store = configureStore({
  reducer: {
    user: userReducer,
    myWork: myWorkReducer,
    metaData: metaDataReducer,
    faq: faqReducer,
    contacts: contactsReducer,
    service: serviceReducer,
    image: imageReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
export const wrapper = createWrapper(() => store);
