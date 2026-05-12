import type {
  Account,
  AssistantMessage,
  BankCard,
  CurrencyRate,
  NavItem,
  NewsItem,
  Transaction,
  UserProfile,
} from '../types/banking';

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Главная', icon: '⌂' },
  { key: 'accounts', label: 'Счета', icon: '₽' },
  { key: 'cards', label: 'Карты', icon: '▣' },
  { key: 'payments', label: 'Платежи', icon: '↗' },
  { key: 'currency', label: 'Валюта', icon: '$' },
  { key: 'news', label: 'Новости', icon: '◆' },
  { key: 'assistant', label: 'Ассистент', icon: '✦' },
  { key: 'profile', label: 'Профиль', icon: '●' },
];

export const profile: UserProfile = {
  fullName: 'Игорь Боланел',
  phone: '+7 900 000-00-00',
  email: 'igor@example.com',
  role: 'user',
  theme: 'light',
  cashbackLevel: 'Premium 5%',
};

export const accounts: Account[] = [
  {
    id: 'acc-main-rub',
    name: 'Основной счёт',
    number: '40817810000000012345',
    balance: 152340.5,
    currency: 'RUB',
    type: 'debit',
    status: 'active',
  },
  {
    id: 'acc-saving-rub',
    name: 'Накопительный счёт',
    number: '40817810000000056789',
    balance: 315000,
    currency: 'RUB',
    type: 'saving',
    status: 'active',
    interestRate: 12.5,
  },
  {
    id: 'acc-usd',
    name: 'Валютный счёт',
    number: '40817840000000099887',
    balance: 820,
    currency: 'USD',
    type: 'debit',
    status: 'active',
  },
];

export const cards: BankCard[] = [
  {
    id: 'card-black',
    name: 'МИК Black',
    maskedNumber: '**** 1234',
    paymentSystem: 'МИР',
    balance: 82340.12,
    currency: 'RUB',
    expiresAt: '08/29',
    color: 'black',
  },
  {
    id: 'card-yellow',
    name: 'МИК Drive',
    maskedNumber: '**** 5678',
    paymentSystem: 'МИР',
    balance: 45600,
    currency: 'RUB',
    expiresAt: '02/30',
    color: 'yellow',
  },
  {
    id: 'card-platinum',
    name: 'МИК Platinum',
    maskedNumber: '**** 9012',
    paymentSystem: 'Mastercard',
    balance: 1250,
    currency: 'USD',
    expiresAt: '11/28',
    color: 'platinum',
  },
];

export const transactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Перевод по номеру счёта',
    category: 'Переводы',
    amount: -1500,
    currency: 'RUB',
    createdAt: '2026-05-10T10:15:00Z',
    status: 'success',
    accountId: 'acc-main-rub',
  },
  {
    id: 'tx-2',
    title: 'Пополнение счёта',
    category: 'Пополнения',
    amount: 10000,
    currency: 'RUB',
    createdAt: '2026-05-09T18:20:00Z',
    status: 'success',
    accountId: 'acc-main-rub',
  },
  {
    id: 'tx-3',
    title: 'Супермаркет',
    category: 'Покупки',
    amount: -3240,
    currency: 'RUB',
    createdAt: '2026-05-08T12:40:00Z',
    status: 'success',
    accountId: 'acc-main-rub',
  },
  {
    id: 'tx-4',
    title: 'Начисление процентов',
    category: 'Накопления',
    amount: 2760,
    currency: 'RUB',
    createdAt: '2026-05-07T09:00:00Z',
    status: 'success',
    accountId: 'acc-saving-rub',
  },
  {
    id: 'tx-5',
    title: 'Обмен валюты',
    category: 'Валюта',
    amount: -120,
    currency: 'USD',
    createdAt: '2026-05-06T16:10:00Z',
    status: 'pending',
    accountId: 'acc-usd',
  },
];

export const currencyRates: CurrencyRate[] = [
  { code: 'USD', name: 'Доллар США', buy: 91.2, sell: 93.8, change: 0.42 },
  { code: 'EUR', name: 'Евро', buy: 99.1, sell: 102.4, change: -0.18 },
  { code: 'CNY', name: 'Юань', buy: 12.52, sell: 13.15, change: 0.07 },
];

export const news: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Как накопительный счёт помогает держать деньги в движении',
    description: 'Разбираем, почему ежедневный остаток и понятная ставка удобнее обычной копилки.',
    tag: 'Сбережения',
    publishedAt: '2026-05-10T09:00:00Z',
  },
  {
    id: 'news-2',
    title: 'Курсы валют: что важно смотреть перед обменом',
    description: 'Покупка, продажа, комиссия и лимиты — четыре вещи, которые влияют на итоговую сумму.',
    tag: 'Валюта',
    publishedAt: '2026-05-09T11:30:00Z',
  },
  {
    id: 'news-3',
    title: 'Безопасные переводы: чек-лист перед отправкой денег',
    description: 'Проверяйте номер счёта, сумму, назначение и статус операции перед подтверждением.',
    tag: 'Безопасность',
    publishedAt: '2026-05-08T15:00:00Z',
  },
];

export const assistantMessages: AssistantMessage[] = [
  {
    id: 'assistant-1',
    role: 'assistant',
    text: 'Привет! Я помогу найти счёт, объяснить перевод или подсказать курс валют.',
    createdAt: '2026-05-10T09:00:00Z',
  },
];

export const quickPrompts = [
  'Как открыть накопительный счёт?',
  'Покажи последние расходы',
  'Как перевести деньги по номеру счёта?',
  'Какая комиссия при обмене валюты?',
];
