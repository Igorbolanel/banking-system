import { accounts, cards, profile, transactions } from '../data/mockData';
import type { Account, BankCard, Transaction, UserProfile } from '../types/banking';
import { API_URLS } from './config';
import { request, withFallback } from './http';

export const coreApi = {
  getProfile() { return withFallback<UserProfile>(() => request(`${API_URLS.core}/api/users/me`), profile); },
  getAccounts() { return withFallback<Account[]>(() => request(`${API_URLS.core}/api/accounts`), accounts); },
  getCards() { return withFallback<BankCard[]>(() => request(`${API_URLS.core}/api/cards`), cards); },
  getTransactions() { return withFallback<Transaction[]>(() => request(`${API_URLS.core}/api/transactions`), transactions); },
  topUp(accountId: string, amount: number) { return withFallback(() => request(`${API_URLS.core}/api/accounts/${accountId}/top-up`, { method: 'POST', body: JSON.stringify({ amount }) }), { ok: true }); },
  transfer(payload: { fromAccountId: string; toAccountNumber: string; amount: number }) { return withFallback(() => request(`${API_URLS.core}/api/transfers`, { method: 'POST', body: JSON.stringify(payload) }), { ok: true }); },
};
