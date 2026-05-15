import { accounts, cards, profile, transactions } from '../data/mockData';
import type { Account, BankCard, Transaction, UserProfile } from '../types/banking';
import { API_URLS } from './config';
import { request, withFallback } from './http';

export const coreApi = {
  getProfile() {
    return withFallback<UserProfile>(() => request(`${API_URLS.core}/api/users/me`), profile);
  },

  getAccounts() {
    return withFallback<Account[]>(() => request(`${API_URLS.core}/api/accounts`), accounts);
  },

  createAccount(payload: Pick<Account, 'name' | 'currency' | 'type'>) {
    const account: Account = {
      id: crypto.randomUUID(),
      number: '40817810000000000000',
      balance: 0,
      status: 'active',
      openedAt: new Date().toISOString(),
      ...payload,
    };

    return withFallback<Account>(
      () =>
        request(`${API_URLS.core}/api/accounts`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      account,
    );
  },

  getCards() {
    return withFallback<BankCard[]>(() => request(`${API_URLS.core}/api/cards`), cards);
  },

  getTransactions() {
    return withFallback<Transaction[]>(
      () => request(`${API_URLS.core}/api/transactions`),
      transactions,
    );
  },

  topUp(accountId: string, amount: number) {
    return withFallback(
      () =>
        request(`${API_URLS.core}/api/accounts/${accountId}/top-up`, {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }),
      { ok: true },
    );
  },

  transfer(payload: { fromAccountId: string; toAccountNumber: string; amount: number }) {
    return withFallback(
      () =>
        request(`${API_URLS.core}/api/transfers`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      { ok: true },
    );
  },
};
