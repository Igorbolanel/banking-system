import { useMemo, useState } from 'react';
import { currencyRates } from '../data/mockData';
import type { CurrencyCode } from '../types/banking';
import { formatMoney } from '../utils/formatters';

function CurrencyPage() {
  const [amount, setAmount] = useState(10000);
  const [target, setTarget] = useState<CurrencyCode>('USD');

  const result = useMemo(() => {
    const rate = currencyRates.find((item) => item.code === target);
    if (!rate) return amount;
    return amount / rate.sell;
  }, [amount, target]);

  return (
    <section className="content__row content__row--wide">
      <div className="card">
        <p className="eyebrow">Конвертация</p>
        <h2>Обмен валюты</h2>

        <form className="form form--page">
          <label>
            Отдаёте, ₽
            <input
              min="1"
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>

          <label>
            Получаете
            <select value={target} onChange={(event) => setTarget(event.target.value as CurrencyCode)}>
              {currencyRates.map((rate) => (
                <option key={rate.code} value={rate.code}>
                  {rate.code}
                </option>
              ))}
            </select>
          </label>

          <div className="converter-result">
            <span>Примерно</span>
            <strong>{formatMoney(result, target)}</strong>
          </div>

          <button className="button-primary" type="button">
            Обменять
          </button>
        </form>
      </div>

      <div className="card">
        <p className="eyebrow">Курсы</p>
        <h2>Покупка и продажа</h2>

        <div className="rates-list">
          {currencyRates.map((rate) => (
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
