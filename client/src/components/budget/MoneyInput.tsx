// client/src/components/budget/MoneyInput.tsx
// Ported/adapted from needim/gider.im-pwa (money-input.tsx) — locale-aware amount entry.
// Uses react-number-format; wires to our formatCurrency + useLanguage.
import * as React from "react";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Currency } from "@/lib/currency-formatter";
import { CURRENCY_CONFIGS } from "@/lib/currency-formatter";

interface MoneyInputProps {
  value: string | number;
  onValueChange: (value: string) => void;
  currency?: Currency;
  className?: string;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
}

// Determine thousand/decimal separators from the currency's locale (es uses ',' decimal).
function getSeparators(currency: Currency, language: "es" | "en") {
  const locale = language === "es" ? CURRENCY_CONFIGS[currency].locale : "en-US";
  const sample = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1234.5);
  const decimalSymbol = sample.includes(",") && sample.indexOf(",") > sample.indexOf("4") ? "," : ".";
  const thousandSymbol = decimalSymbol === "," ? "." : ",";
  return { decimalSymbol, thousandSymbol };
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onValueChange, currency = "HNL", className, placeholder, id, ...rest }, ref) => {
    const { language } = useLanguage();
    const { decimalSymbol, thousandSymbol } = getSeparators(currency, language);
    const symbol = CURRENCY_CONFIGS[currency].symbol;

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring",
          className
        )}
      >
        <span className="text-lg font-semibold text-muted-foreground">{symbol}</span>
        <NumericFormat
          id={id}
          getInputRef={ref}
          className="w-full bg-transparent text-lg font-medium tabular-nums outline-none placeholder:text-muted-foreground"
          value={value}
          onValueChange={(values: NumberFormatValues) => onValueChange(values.value)}
          allowNegative={false}
          thousandSeparator={thousandSymbol}
          decimalSeparator={decimalSymbol}
          decimalScale={CURRENCY_CONFIGS[currency].decimals}
          fixedDecimalScale={false}
          valueIsNumericString
          inputMode="decimal"
          placeholder={placeholder ?? "0.00"}
          aria-label={rest["aria-label"] ?? "Amount"}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";
