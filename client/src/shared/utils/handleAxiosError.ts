import { AxiosError } from 'axios';
import { ServerResponseType } from '../types';

const defaultRejectedAxiosError = {
  data: null,
  statusCode: 500,
  message: 'Жаль, но Неизвестная ошибка',
  error: 'Жаль, но Неизвестная ошибка',
};

export function handleAxiosError(error: unknown): ServerResponseType<null> {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_CANCELED') {
      return {
        ...defaultRejectedAxiosError,
        error: 'Жаль, но Время ожидания ответа истекло. Повторите попытку позже.',
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        ...defaultRejectedAxiosError,
        error: 'Жаль, но Не удалось подключиться к серверу. Повторите попытку позже.',
      };
    }

    if (error.response) {
      return error.response.data;
    }
  }

  return defaultRejectedAxiosError;
}
