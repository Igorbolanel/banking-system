export type Page =
  | 'dashboard'
  | 'accounts'
  | 'cards'
  | 'payments'
  | 'currency'
  | 'profile'
  | 'news'
  | 'assistant';

export type Action = 'topup' | 'transfer' | 'pay';

export interface Account {
  name: string;
  balance: number;
  currency: string;
}

export interface BankCard {
  id: string;
  name: string;
  maskedNumber: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface NavItem {
  key: Page;
  label: string;
}