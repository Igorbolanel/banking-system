import { API_URLS } from './config';
import { request, withFallback } from './http';

export const assistantApi = {
  sendMessage(message: string) {
    return withFallback<{ answer: string }>(() => request(`${API_URLS.assistant}/api/chat`, { method: 'POST', body: JSON.stringify({ message }) }), { answer: 'Пока Assistant Service не подключён, я отвечаю из frontend fallback.' });
  },
};
