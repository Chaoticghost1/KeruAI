// client/src/components/budget/CurrencySelector.tsx
// Ported/adapted from needim/gider.im-pwa (currency-selector.tsx / input-currency.tsx).
// Lets the user pick a per-transaction currency (Honduras-first default: HNL).
import * as React from "react";
import { CURRENCY_CONFIGS, SUPPORTED_CURRENCIES, type Currency } from "@/lib/currency-formatter";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
  id?: string;
}

export function CurrencySelector({ value, onChange, className, id }: CurrencySelectorProps) {
  return (
    <select
      id={id}
      aria-label="Currency"
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      className={cn(
        "h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    >
      {SUPPORTED_CURRENCIES.map((code) => (
        <option key={code} value={code}>
          {CURRENCY_CONFIGS[code].symbol} {code} — {CURRENCY_CONFIGS[code].name}
        </option>
      ))}
    </select>
  );
}
