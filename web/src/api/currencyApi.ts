import { currencyRates } from '../data/mockData';
import type { CurrencyCode, CurrencyRate } from '../types/banking';
import { API_URLS } from './config';
import { request, withFallback } from './http';

export const currencyApi = {
  getRates() { return withFallback<CurrencyRate[]>(() => request(`${API_URLS.currencies}/api/rates`), currencyRates); },
  convert(payload: { from: CurrencyCode; to: CurrencyCode; amount: number }) {
    const target = currencyRates.find((rate) => rate.code === payload.to);
    const fallbackResult = target ? payload.amount / target.sell : payload.amount;
    return withFallback<{ result: number }>(() => request(`${API_URLS.currencies}/api/convert`, { method: 'POST', body: JSON.stringify(payload) }), { result: fallbackResult });
  },
};
