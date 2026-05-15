import { useMemo, useState } from 'react';
import type { BankingState, CurrencyCode } from '../types/banking';
import { formatMoney } from '../utils/formatters';

interface CurrencyPageProps {
  state: BankingState;
  onExchange: (payload: { fromAccountId: string; toCurrency: CurrencyCode; amount: number }) => void;
}

function CurrencyPage({ state, onExchange }: CurrencyPageProps) {
  const [amount, setAmount] = useState(10000);
  const [target, setTarget] = useState<CurrencyCode>('USD');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '');

  const result = useMemo(() => {
    const rate = state.rates.find((item) => item.code === target);
    if (!rate) return amount;
    return amount / rate.sell;
  }, [amount, target, state.rates]);

  return (
    <section className="content__row content__row--wide">
      <div className="card">
        <p className="eyebrow">Конвертация</p>
        <h2>Обмен валюты</h2>

        <form
          className="form form--page"
          onSubmit={(event) => {
            event.preventDefault();
            onExchange({ fromAccountId: accountId, toCurrency: target, amount });
          }}
        >
          <label>
            Счёт списания
            <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
              {state.accounts.filter((account) => account.status === 'active').map((account) => (
                <option key={account.id} value={account.id}>{account.name} — {formatMoney(account.balance, account.currency)}</option>
              ))}
            </select>
          </label>

          <label>
            Отдаёте
            <input min="1" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </label>

          <label>
            Получаете
            <select value={target} onChange={(event) => setTarget(event.target.value as CurrencyCode)}>
              {state.rates.map((rate) => (
                <option key={rate.code} value={rate.code}>{rate.code}</option>
              ))}
            </select>
          </label>

          <div className="converter-result">
            <span>Примерно</span>
            <strong>{formatMoney(result, target)}</strong>
          </div>

          <button className="button-primary" type="submit">Обменять</button>
        </form>
      </div>

      <div className="card">
        <p className="eyebrow">Курсы</p>
        <h2>Покупка и продажа</h2>

        <div className="rates-list">
          {state.rates.map((rate) => (
            <div className="rate-row" key={rate.code}>
              <div>
                <strong>{rate.code}</strong>
                <span>{rate.name}</span>
              </div>
              <div className="rate-row__values">
                <span>Покупка {rate.buy.toFixed(2)}</span>
                <strong>Продажа {rate.sell.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CurrencyPage;
