import type { CategoryInfo } from './types';

/** Справочник категорий — тот же, что OperationCategory на бэкенде. */
export const CATEGORY_CATALOG: CategoryInfo[] = [
  { code: 'SUPERMARKETS', label: 'Супермаркеты', color: '#F09A7E', icon: 'cart', kind: 'EXPENSE' },
  { code: 'MARKETPLACES', label: 'Маркетплейсы', color: '#B04BEA', icon: 'basket', kind: 'EXPENSE' },
  { code: 'RESTAURANTS', label: 'Рестораны', color: '#F26B5B', icon: 'restaurant', kind: 'EXPENSE' },
  { code: 'FAST_FOOD', label: 'Фастфуд', color: '#FF9F43', icon: 'fastfood', kind: 'EXPENSE' },
  { code: 'LOCAL_TRANSPORT', label: 'Местный транспорт', color: '#F5B53F', icon: 'bus', kind: 'EXPENSE' },
  { code: 'RAILWAY', label: 'Ж/д билеты', color: '#4FB0C6', icon: 'train', kind: 'EXPENSE' },
  { code: 'TAXI', label: 'Такси', color: '#E8C547', icon: 'taxi', kind: 'EXPENSE' },
  { code: 'DIGITAL_GOODS', label: 'Цифровые товары', color: '#E7A0E4', icon: 'digital', kind: 'EXPENSE' },
  { code: 'PHARMACY', label: 'Аптеки', color: '#5ED39A', icon: 'pharmacy', kind: 'EXPENSE' },
  { code: 'MOBILE', label: 'Мобильная связь', color: '#6B8CFF', icon: 'phone', kind: 'EXPENSE' },
  { code: 'UTILITIES', label: 'ЖКХ', color: '#8D99AE', icon: 'home', kind: 'EXPENSE' },
  { code: 'CLOTHES', label: 'Одежда и обувь', color: '#FF6FA3', icon: 'clothes', kind: 'EXPENSE' },
  { code: 'ENTERTAINMENT', label: 'Развлечения', color: '#9B7BFF', icon: 'ticket', kind: 'EXPENSE' },
  { code: 'CASH', label: 'Наличные', color: '#57C785', icon: 'cash', kind: 'EXPENSE' },
  { code: 'TRANSFERS', label: 'Переводы', color: '#6CC3DA', icon: 'transfer', kind: 'BOTH' },
  { code: 'TOP_UP', label: 'Пополнения', color: '#7ECFC6', icon: 'topup', kind: 'INCOME' },
  { code: 'INTEREST', label: 'Проценты', color: '#3ECF8E', icon: 'percent', kind: 'INCOME' },
  { code: 'CASHBACK', label: 'Кэшбэк', color: '#FFC94D', icon: 'cashback', kind: 'INCOME' },
  { code: 'CURRENCY_EXCHANGE', label: 'Обмен валюты', color: '#4DA3FF', icon: 'exchange', kind: 'BOTH' },
  { code: 'OTHER', label: 'Остальное', color: '#A0A7B4', icon: 'other', kind: 'BOTH' },
];

const OTHER_CATEGORY: CategoryInfo = { code: 'OTHER', label: 'Остальное', color: '#A0A7B4', icon: 'other', kind: 'BOTH' };

const BY_CODE = new Map(CATEGORY_CATALOG.map((category) => [category.code, category]));

export function getCategory(code: string | null | undefined): CategoryInfo {
  return (code && BY_CODE.get(code)) || OTHER_CATEGORY;
}

export function categoriesFor(direction: 'EXPENSE' | 'INCOME'): CategoryInfo[] {
  return CATEGORY_CATALOG.filter((category) => category.kind === 'BOTH' || category.kind === direction);
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

/** Правила определения категории по названию магазина — копия MerchantCategoryResolver. */
const MERCHANT_RULES: Array<[string, string[]]> = [
  ['DIGITAL_GOODS', ['app store', 'apple.com', 'itunes', 'google play', 'steam', 'playstation', 'xbox', 'кинопоиск', 'яндекс плюс', 'yandex plus', 'spotify', 'netflix', 'okko', ' иви ', ' ivi ', 'подписк', 'icloud', 'telegram premium', 'vk музыка']],
  ['MARKETPLACES', ['ozon', 'озон', 'wildberries', 'вайлдберриз', 'яндекс маркет', 'yandex market', 'aliexpress', 'алиэкспресс', 'мегамаркет', 'маркетплейс', 'avito', 'авито']],
  ['SUPERMARKETS', ['пятерочка', 'перекресток', 'магнит', 'ашан', 'auchan', 'лента', 'вкусвилл', 'дикси', 'азбука вкуса', 'spar', 'окей', 'самокат', 'чижик', 'светофор', 'супермаркет', 'гипермаркет', 'продукты']],
  ['FAST_FOOD', ['kfc', 'rostic', 'вкусно и точка', 'бургер', 'burger', 'макдоналдс', 'mcdonald', 'додо', 'dodo', 'шаурм', 'subway', 'теремок']],
  ['RESTAURANTS', ['ресторан', 'кафе', 'шоколадница', 'кофемания', 'coffee', 'кофе', 'суши', 'пиццерия', 'столовая', ' бар ']],
  ['RAILWAY', ['ржд', 'rzd', 'туту.ру', 'tutu.ru', 'поезд', 'ж/д', 'жд билет', 'ласточка', 'сапсан']],
  ['TAXI', ['такси', 'taxi', 'яндекс go', 'yandex go', 'uber', 'ситимобил']],
  ['LOCAL_TRANSPORT', ['метро', 'мосгортранс', 'тройка', 'автобус', 'трамвай', 'троллейбус', 'электричка', 'цппк', 'подорожник', 'whoosh', 'юрент', 'urent', 'транспорт']],
  ['PHARMACY', ['аптек', 'apteka', 'ригла', 'горздрав', 'здравсити', '36,6']],
  ['MOBILE', ['мтс', ' mts ', 'билайн', 'beeline', 'мегафон', 'megafon', 'теле2', 'tele2', 'yota', 'ростелеком', 'мобильная связь']],
  ['UTILITIES', ['жкх', 'мосэнерго', 'энергосбыт', 'водоканал', 'квартплата', 'коммунал', 'мосгаз']],
  ['CLOTHES', ['zara', 'h&m', 'uniqlo', 'lamoda', 'ламода', 'спортмастер', 'gloria jeans', 'befree', 'love republic', 'ostin', 'остин', 'одежд', 'обувь']],
  ['ENTERTAINMENT', ['кино', 'синема', 'cinema', 'театр', 'концерт', 'афиша', 'kassir', 'боулинг', 'квест', 'музей']],
  ['CASH', ['банкомат', ' atm ', 'наличн']],
];

export function detectCategory(text: string | null | undefined): string | null {
  const normalized = ` ${normalizeText(text)} `;
  if (!normalized.trim()) {
    return null;
  }
  for (const [code, keywords] of MERCHANT_RULES) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return code;
    }
  }
  return null;
}
