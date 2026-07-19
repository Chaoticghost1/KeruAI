// client/src/components/budget/BudgetFab.tsx
// Floating action button to add a transaction (gider add-entry pattern).
import * as React from "react";
import { Plus } from "lucide-react";
import { STYLE_TOKENS } from "@/components/mobile/tokens";

interface BudgetFabProps {
  onClick: () => void;
  label?: string;
}

export function BudgetFab({ onClick, label = "Add" }: BudgetFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${STYLE_TOKENS.fab} min-h-[56px] min-w-[56px] text-xl font-bold`}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
