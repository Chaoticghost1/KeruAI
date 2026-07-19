// Honduras-first currency formatting utilities
export type Currency = 'HNL' | 'USD' | 'EUR' | 'MXN' | 'GTQ' | 'NIO' | 'CRC' | 'COP' | 'PEN' | 'BRL' | 'GBP' | 'JPY';
export type Language = 'es' | 'en';

interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  decimals: number;
  locale: string;
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  HNL: { symbol: 'L', code: 'HNL', name: 'Lempira', decimals: 2, locale: 'es-HN' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', decimals: 2, locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', decimals: 2, locale: 'es-ES' },
  MXN: { symbol: '$', code: 'MXN', name: 'Peso mexicano', decimals: 2, locale: 'es-MX' },
  GTQ: { symbol: 'Q', code: 'GTQ', name: 'Quetzal', decimals: 2, locale: 'es-GT' },
  NIO: { symbol: 'C$', code: 'NIO', name: 'Córdoba', decimals: 2, locale: 'es-NI' },
  CRC: { symbol: '₡', code: 'CRC', name: 'Colón costarricense', decimals: 2, locale: 'es-CR' },
  COP: { symbol: '$', code: 'COP', name: 'Peso colombiano', decimals: 0, locale: 'es-CO' },
  PEN: { symbol: 'S/', code: 'PEN', name: 'Sol', decimals: 2, locale: 'es-PE' },
  BRL: { symbol: 'R$', code: 'BRL', name: 'Real', decimals: 2, locale: 'pt-BR' },
  GBP: { symbol: '£', code: 'GBP', name: 'Pound', decimals: 2, locale: 'en-GB' },
  JPY: { symbol: '¥', code: 'JPY', name: 'Yen', decimals: 0, locale: 'ja-JP' },
};

// Honduras-first: Approximate exchange rates to HNL (illustrative; production should fetch live rates)
const HNL_RATES: Record<Currency, number> = {
  HNL: 1,
  USD: 25,
  EUR: 27,
  MXN: 1.45,
  GTQ: 3.2,
  NIO: 0.69,
  CRC: 0.043,
  COP: 0.0062,
  PEN: 6.6,
  BRL: 4.7,
  GBP: 31,
  JPY: 0.17,
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIGS) as Currency[];

// Honduras-first: Approximate exchange rate (should be fetched from API in production)
const USD_TO_HNL_RATE = 25;

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;
  const inHnl = amount * HNL_RATES[fromCurrency];
  return inHnl / HNL_RATES[toCurrency];
}

// Convert any supported currency to HNL (Honduras-first display)
export function toHNL(amount: number, fromCurrency: Currency): number {
  return amount * HNL_RATES[fromCurrency];
}

export function formatCurrency(
  amount: number, 
  currency: Currency = 'HNL', // Honduras-first default
  language: Language = 'es'
): string {
  const config = CURRENCY_CONFIGS[currency];
  const locale = language === 'es' ? config.locale : 'en-US';
  const numberPart = amount.toLocaleString(locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });
  return `${config.symbol} ${numberPart}`;
}

// Utility for converting USD amounts to HNL for Honduras-first display
export function formatAsHondurasCurrency(usdAmount: number, language: Language = 'es'): string {
  const hnlAmount = convertCurrency(usdAmount, 'USD', 'HNL');
  return formatCurrency(hnlAmount, 'HNL', language);
}

// Parse currency string back to number (for form inputs)
export function parseCurrencyString(currencyString: string, currency: Currency = 'HNL'): number {
  const config = CURRENCY_CONFIGS[currency];
  const cleanString = currencyString
    .replace(config.symbol, '')
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  
  return parseFloat(cleanString) || 0;
}

export { CURRENCY_CONFIGS };