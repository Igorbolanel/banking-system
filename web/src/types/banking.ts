export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'CNY';

export type Page =
  | 'dashboard'
  | 'accounts'
  | 'cards'
  | 'payments'
  | 'currency'
  | 'news'
  | 'assistant'
  | 'profile';

export type Action = 'topup' | 'transfer' | 'pay' | 'exchange' | 'openAccount';

export interface NavItem {
  key: Page;
  label: string;
  icon: string;
}

export interface Account {
  id: string;
  name: string;
  number: string;
  balance: number;
  currency: CurrencyCode;
  type: 'debit' | 'saving' | 'credit';
  status: 'active' | 'closed';
  interestRate?: number;
}

export interface BankCard {
  id: string;
  name: string;
  maskedNumber: string;
  paymentSystem: 'МИР' | 'Visa' | 'Mastercard';
  balance: number;
  currency: CurrencyCode;
  expiresAt: string;
  color: 'yellow' | 'black' | 'platinum';
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: CurrencyCode;
  createdAt: string;
  status: 'success' | 'pending' | 'failed';
  accountId: string;
}

export interface CurrencyRate {
  code: Exclude<CurrencyCode, 'RUB'>;
  name: string;
  buy: number;
  sell: number;
  change: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  publishedAt: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  role: 'user' | 'admin';
  theme: 'light' | 'dark';
  cashbackLevel: string;
}
