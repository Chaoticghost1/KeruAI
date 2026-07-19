// client/src/components/budget/EntryRow.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EntryRow, type BudgetEntryView } from "./EntryRow";
import { LanguageProvider } from "@/contexts/LanguageContext";

const base: BudgetEntryView = {
  id: 1,
  description: "Lunch",
  amount: 50,
  currency: "HNL",
  type: "expense",
  date: "2026-07-19T00:00:00.000Z",
  paid: true,
  categoryName: "Food",
};

describe("EntryRow", () => {
  it("shows the description and a minus sign for expenses", () => {
    render(
      <LanguageProvider>
        <EntryRow entry={base} onOpen={() => {}} onTogglePaid={() => {}} />
      </LanguageProvider>
    );
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText(/−/)).toBeInTheDocument();
  });

  it("calls onOpen when the row body is tapped", () => {
    const onOpen = vi.fn();
    render(
      <LanguageProvider>
        <EntryRow entry={base} onOpen={onOpen} onTogglePaid={() => {}} />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText("Lunch"));
    expect(onOpen).toHaveBeenCalledWith(base);
  });

  it("calls onTogglePaid when the checkbox is tapped", () => {
    const onToggle = vi.fn();
    render(
      <LanguageProvider>
        <EntryRow entry={base} onOpen={() => {}} onTogglePaid={onToggle} />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByLabelText("Mark as unpaid"));
    expect(onToggle).toHaveBeenCalledWith(base);
  });

  it("shows recurring badge when recurring", () => {
    render(
      <LanguageProvider>
        <EntryRow
          entry={{ ...base, recurring: true, recurringIndex: 2, recurringTotal: 12 }}
          onOpen={() => {}}
          onTogglePaid={() => {}}
        />
      </LanguageProvider>
    );
    expect(screen.getByText("2/12")).toBeInTheDocument();
  });
});
