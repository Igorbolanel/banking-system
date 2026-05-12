import { API_URLS } from './config';
import { request, withFallback } from './http';

export const assistantApi = {
  sendMessage(message: string) {
    return withFallback<{ answer: string }>(
      () =>
        request(`${API_URLS.assistant}/api/chat`, {
          method: 'POST',
          body: JSON.stringify({ message }),
        }),
      {
        answer:
          'Пока backend ассистента не подключён, я отвечаю из фронтового fallback. Позже здесь будет ответ Assistant Service.',
      },
    );
  },
};
