// Honduras-first currency formatting utilities
export type Currency = 'HNL' | 'USD';
export type Language = 'es' | 'en';

interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  decimals: number;
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  HNL: {
    symbol: 'L',
    code: 'HNL',
    name: 'Lempira',
    decimals: 2
  },
  USD: {
    symbol: '$',
    code: 'USD', 
    name: 'Dollar',
    decimals: 2
  }
};

// Honduras-first: Approximate exchange rate (should be fetched from API in production)
const USD_TO_HNL_RATE = 25;

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'HNL') {
    return amount * USD_TO_HNL_RATE;
  }
  
  if (fromCurrency === 'HNL' && toCurrency === 'USD') {
    return amount / USD_TO_HNL_RATE;
  }
  
  return amount;
}

export function formatCurrency(
  amount: number, 
  currency: Currency = 'HNL', // Honduras-first default
  language: Language = 'es'
): string {
  const config = CURRENCY_CONFIGS[currency];
  const formattedAmount = amount.toFixed(config.decimals);
  
  // Honduras-first formatting: Use spaces and local number format
  const numberPart = Number(formattedAmount).toLocaleString(language === 'es' ? 'es-HN' : 'en-US');
  
  if (currency === 'HNL') {
    return `L ${numberPart}`;
  } else {
    return `$${numberPart}`;
  }
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