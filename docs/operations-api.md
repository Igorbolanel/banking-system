# API раздела «Операции»

Базовый путь: `/api/operations`. Все методы требуют авторизации (сессия), ответы обёрнуты в `UniversalResponse` (`{ code, message, data }`).
POST-запросы отправляются с заголовком `X-XSRF-TOKEN`, как остальные запросы фронтенда.

## Поиск операций

`GET /api/operations`

| Параметр | Пример | Описание |
| --- | --- | --- |
| `query` | `пятёрочка`, `5 936`, `4321` | Текст: магазин, категория, сумма или цифры номера счёта |
| `categories` | `SUPERMARKETS,TAXI` | Коды категорий |
| `direction` | `EXPENSE` | `ALL`, `EXPENSE` или `INCOME` |
| `accountIds` | `1,3` | Счета пользователя |
| `from`, `to` | `2026-10-01`, `2026-10-31` | Даты включительно |
| `minAmount`, `maxAmount` | `100` | Границы суммы |
| `excludeTransfers` | `true` | Скрыть переводы |
| `page`, `size` | `0`, `40` | Страница, по умолчанию 30 записей (максимум 200) |

```json
{
  "items": [{
    "id": 128, "direction": "EXPENSE", "type": "WITHDRAWAL", "status": "COMPLETED",
    "category": "SUPERMARKETS", "categoryLabel": "Супермаркеты", "categoryColor": "#F09A7E", "categoryIcon": "cart",
    "title": "Пятёрочка", "description": "Пятёрочка", "amount": 1250.00, "currency": "RUB",
    "accountId": 1, "accountNumber": "40817810400000012345", "counterpartyAccountNumber": null,
    "createdAt": "2026-10-05T14:21:07Z", "categoryEditable": true
  }],
  "page": 0, "size": 40, "totalElements": 18, "hasNext": false
}
```

## Аналитика

`GET /api/operations/analytics?period=MONTH&date=2026-10-06&currency=RUB&excludeTransfers=false&accountIds=1,2`

- `period` — `WEEK`, `MONTH` или `YEAR`. Окно — календарная неделя, месяц или год, в который попадает `date`.
- Проценты целые, в сумме ровно 100; `share` — точная доля, по ней фронтенд пишет «<1%».
- `previousTotal` и `difference` — сравнение с прошлым таким же периодом.
- `timeline` — столбики: дни для недели и месяца, месяцы для года.

```json
{
  "period": "MONTH", "from": "2026-10-01", "to": "2026-11-01", "label": "Октябрь", "currency": "RUB",
  "expenses": {
    "total": 49900.00, "previousTotal": 239822.00, "difference": -189922.00,
    "categories": [
      { "category": "TRANSFERS", "label": "Переводы", "color": "#6CC3DA", "icon": "transfer",
        "amount": 42047.00, "percent": 84, "share": 0.8426, "count": 6 }
    ]
  },
  "income": { "total": 59000.00, "previousTotal": 233268.00, "difference": -174268.00, "categories": [] },
  "timeline": [{ "from": "2026-10-01", "to": "2026-10-02", "label": "1", "expense": 1250.00, "income": 0.00,
                 "expenseByCategory": { "SUPERMARKETS": 1250.00 }, "incomeByCategory": {} }],
  "skippedCurrencies": []
}
```

## Остальные методы

| Метод | Назначение |
| --- | --- |
| `GET /api/operations/categories` | Справочник категорий: код, название, цвет, иконка, `EXPENSE` / `INCOME` / `BOTH` |
| `GET /api/operations/suggestions?query=пят` | Подсказки: категории и магазины, где пользователь уже платил |
| `POST /api/operations/{id}/category` | Сменить категорию: `{ "category": "TAXI" }` |
| `POST /api/operations/payments` | Оплатить покупку: `{ "accountId": 1, "amount": 450, "merchant": "Яндекс Go", "category": "TAXI" }` — категорию можно не передавать, она определится по названию |
