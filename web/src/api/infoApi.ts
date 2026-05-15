import { news } from '../data/mockData';
import type { NewsItem } from '../types/banking';
import { API_URLS } from './config';
import { request, withFallback } from './http';

export const infoApi = {
  getNews() {
    return withFallback<NewsItem[]>(() => request(`${API_URLS.info}/api/news`), news);
  },
};
