import { useEffect, useMemo, useState } from 'react';
import { initialBankingState } from '../data/mockData';
import type { Action, Account, AssistantMessage, BankingState, CurrencyCode, Theme, Transaction } from '../types/banking';
import { createAccountNumber, getTotalBalance } from '../utils/calculations';

const STORAGE_KEY = 'mik-bank-state-v2';
type ToastType = 'success' | 'info' | 'error';
export interface Toast { id: string; type: ToastType; title: string; text?: string }

function readInitialState(): BankingState {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? (JSON.parse(saved) as BankingState) : initialBankingState; } catch { return initialBankingState; }
}

function createTransaction(payload: Omit<Transaction, 'id' | 'createdAt' | 'status'>): Transaction {
  return { id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'success', ...payload };
}

export function useBankingState() {
  const [state, setState] = useState<BankingState>(readInitialState);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); document.documentElement.dataset.theme = state.profile.theme; }, [state]);

  function notify(type: ToastType, title: string, text?: string) {
    const toast: Toast = { id: crypto.randomUUID(), type, title, text };
    setToasts((current) => [...current, toast]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), 3500);
  }
  function removeToast(id: string) { setToasts((current) => current.filter((toast) => toast.id !== id)); }
  function resetDemoData() { localStorage.removeItem(STORAGE_KEY); setState(initialBankingState); notify('info', 'Демо-данные восстановлены'); }
  function setTheme(theme: Theme) { setState((current) => ({ ...current, profile: { ...current.profile, theme } })); notify('success', theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена'); }
  function updateProfile(payload: Partial<BankingState['profile']>) { setState((current) => ({ ...current, profile: { ...current.profile, ...payload } })); notify('success', 'Профиль обновлён'); }

  function openAccount(payload: { name: string; currency: CurrencyCode; type: Account['type'] }) {
    const account: Account = { id: crypto.randomUUID(), name: payload.name || 'Новый счёт', number: createAccountNumber(), balance: 0, currency: payload.currency, type: payload.type, status: 'active', interestRate: payload.type === 'saving' ? 12.5 : undefined, openedAt: new Date().toISOString() };
    setState((current) => ({ ...current, accounts: [account, ...current.accounts] }));
    notify('success', 'Счёт открыт', account.name);
  }
  function closeAccount(accountId: string) { setState((current) => ({ ...current, accounts: current.accounts.map((account) => account.id === accountId ? { ...account, status: 'closed' } : account) })); notify('info', 'Счёт закрыт'); }
  function topUp(accountId: string, amount: number) {
    if (!amount || amount <= 0) { notify('error', 'Введите корректную сумму'); return; }
    const account = state.accounts.find((item) => item.id === accountId); if (!account) return;
    const transaction = createTransaction({ title: 'Пополнение счёта', category: 'Пополнения', amount, currency: account.currency, accountId, type: 'income' });
    setState((current) => ({ ...current, accounts: current.accounts.map((item) => item.id === accountId ? { ...item, balance: item.balance + amount } : item), transactions: [transaction, ...current.transactions] }));
    notify('success', 'Счёт пополнен');
  }
  function transfer(payload: { fromAccountId: string; toAccountNumber: string; amount: number }) {
    const account = state.accounts.find((item) => item.id === payload.fromAccountId);
    if (!account || payload.amount <= 0) { notify('error', 'Проверьте данные перевода'); return; }
    if (account.balance < payload.amount) { notify('error', 'Недостаточно средств'); return; }
    const transaction = createTransaction({ title: `Перевод на ${payload.toAccountNumber.slice(-4)}`, category: 'Переводы', amount: -payload.amount, currency: account.currency, accountId: account.id, type: 'transfer' });
    setState((current) => ({ ...current, accounts: current.accounts.map((item) => item.id === account.id ? { ...item, balance: item.balance - payload.amount } : item), transactions: [transaction, ...current.transactions] }));
    notify('success', 'Перевод отправлен', 'Операция добавлена в историю');
  }
  function pay(payload: { accountId: string; title: string; amount: number }) {
    const account = state.accounts.find((item) => item.id === payload.accountId);
    if (!account || payload.amount <= 0) { notify('error', 'Проверьте данные платежа'); return; }
    if (account.balance < payload.amount) { notify('error', 'Недостаточно средств'); return; }
    const transaction = createTransaction({ title: payload.title || 'Оплата услуг', category: 'Платежи', amount: -payload.amount, currency: account.currency, accountId: account.id, type: 'outcome' });
    setState((current) => ({ ...current, accounts: current.accounts.map((item) => item.id === account.id ? { ...item, balance: item.balance - payload.amount } : item), transactions: [transaction, ...current.transactions] }));
    notify('success', 'Платёж выполнен');
  }
  function exchange(payload: { fromAccountId: string; toCurrency: CurrencyCode; amount: number }) {
    const account = state.accounts.find((item) => item.id === payload.fromAccountId); const rate = state.rates.find((item) => item.code === payload.toCurrency);
    if (!account || payload.amount <= 0 || !rate || account.balance < payload.amount) { notify('error', 'Проверьте параметры обмена'); return; }
    const result = payload.amount / rate.sell;
    const transaction = createTransaction({ title: `Обмен ${account.currency} → ${payload.toCurrency}`, category: 'Валюта', amount: -payload.amount, currency: account.currency, accountId: account.id, type: 'exchange' });
    setState((current) => ({ ...current, accounts: current.accounts.map((item) => item.id === account.id ? { ...item, balance: item.balance - payload.amount } : item), transactions: [transaction, ...current.transactions] }));
    notify('success', 'Валюта обменяна', `Примерно ${result.toFixed(2)} ${payload.toCurrency}`);
  }
  function submitAction(action: Action, payload: Record<string, string | number>) {
    if (action === 'openAccount') openAccount({ name: String(payload.name || 'Новый счёт'), currency: String(payload.currency || 'RUB') as CurrencyCode, type: String(payload.type || 'debit') as Account['type'] });
    if (action === 'topup') topUp(String(payload.accountId), Number(payload.amount));
    if (action === 'transfer') transfer({ fromAccountId: String(payload.accountId), toAccountNumber: String(payload.toAccountNumber), amount: Number(payload.amount) });
    if (action === 'pay') pay({ accountId: String(payload.accountId), title: String(payload.title || 'Оплата услуг'), amount: Number(payload.amount) });
    if (action === 'exchange') exchange({ fromAccountId: String(payload.accountId), toCurrency: String(payload.toCurrency || 'USD') as CurrencyCode, amount: Number(payload.amount) });
  }
  function sendAssistantMessage(text: string) {
    if (!text.trim()) return;
    const userMessage: AssistantMessage = { id: crypto.randomUUID(), role: 'user', text, createdAt: new Date().toISOString() };
    const lower = text.toLowerCase(); const total = getTotalBalance(state.accounts, state.rates);
    let answer = 'Я могу подсказать по счетам, переводам, валюте и последним операциям. Backend ассистента подключится через Assistant Service.';
    if (lower.includes('расход') || lower.includes('операц')) answer = `Последние операции: ${state.transactions.slice(0, 3).map((tx) => `${tx.title}: ${tx.amount} ${tx.currency}`).join('; ')}.`;
    if (lower.includes('баланс') || lower.includes('деньг')) answer = `Общий баланс по активным счетам примерно ${Math.round(total).toLocaleString('ru-RU')} ₽.`;
    if (lower.includes('накоп')) answer = 'Накопительный счёт можно открыть в разделе «Счета». В демо-данных ставка указана 12.5% годовых.';
    if (lower.includes('валют') || lower.includes('курс')) answer = `Текущие демо-курсы продажи: ${state.rates.map((rate) => `${rate.code}: ${rate.sell.toFixed(2)} ₽`).join(', ')}.`;
    const assistantMessage: AssistantMessage = { id: crypto.randomUUID(), role: 'assistant', text: answer, createdAt: new Date().toISOString() };
    setState((current) => ({ ...current, assistantMessages: [...current.assistantMessages, userMessage, assistantMessage] }));
  }
  const summary = useMemo(() => ({ totalBalance: getTotalBalance(state.accounts, state.rates), activeAccounts: state.accounts.filter((account) => account.status === 'active'), latestTransactions: state.transactions.slice(0, 6) }), [state.accounts, state.rates, state.transactions]);
  return { state, summary, toasts, notify, removeToast, resetDemoData, setTheme, updateProfile, openAccount, closeAccount, topUp, transfer, pay, exchange, submitAction, sendAssistantMessage };
}
