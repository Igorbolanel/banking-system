export const API_URLS = {
  core: import.meta.env.VITE_CORE_API_URL ?? 'http://localhost:8080',
  currencies: import.meta.env.VITE_CURRENCIES_API_URL ?? 'http://localhost:8081',
  info: import.meta.env.VITE_INFO_API_URL ?? 'http://localhost:8082',
  assistant: import.meta.env.VITE_ASSISTANT_API_URL ?? 'http://localhost:8083',
};
