import type { Account, BankCard, NavItem, Transaction } from '../types/banking';

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Главная' },
  { key: 'accounts', label: 'Счета' },
  { key: 'cards', label: 'Карты' },
  { key: 'payments', label: 'Платежи' },
  { key: 'currency', label: 'Валюта' },
  { key: 'news', label: 'Новости' },
  { key: 'assistant', label: 'Ассистент' },
  { key: 'profile', label: 'Профиль' },
];

export const mainAccount: Account = {
  name: 'Основной счёт',
  balance: 152340.5,
  currency: '₽',
};

export const cards: BankCard[] = [
  {
    id: 'card-1',
    name: 'Дебетовая карта',
    maskedNumber: '**** 1234',
    balance: 82340.12,
    currency: '₽',
  },
  {
    id: 'card-2',
    name: 'Кредитная карта',
    maskedNumber: '**** 5678',
    balance: -12450,
    currency: '₽',
  },
];

export const transactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Перевод по номеру телефона',
    category: 'Переводы',
    amount: -1500,
    currency: '₽',
    createdAt: '2026-05-05T10:15:00Z',
  },
  {
    id: 'tx-2',
    title: 'Пополнение счёта',
    category: 'Пополнения',
    amount: 10000,
    currency: '₽',
    createdAt: '2026-05-04T18:20:00Z',
  },
  {
    id: 'tx-3',
    title: 'Покупка в супермаркете',
    category: 'Покупки',
    amount: -3240,
    currency: '₽',
    createdAt: '2026-05-03T12:40:00Z',
  },
];