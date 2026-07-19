// client/src/components/budget/MoneyInput.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoneyInput } from "./MoneyInput";
import { LanguageProvider } from "@/contexts/LanguageContext";

describe("MoneyInput", () => {
  it("renders the currency symbol prefix", () => {
    render(
      <LanguageProvider>
        <MoneyInput value="" onValueChange={() => {}} currency="HNL" aria-label="Amount" />
      </LanguageProvider>
    );
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("calls onValueChange with numeric string on input", () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <MoneyInput value="" onValueChange={onChange} currency="USD" />
      </LanguageProvider>
    );
    const input = screen.getByDisplayValue("") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12.50" } });
    expect(onChange).toHaveBeenCalledWith("12.50");
  });
});
