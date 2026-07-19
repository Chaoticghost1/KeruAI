// client/src/components/dao/DaoFab.tsx
// Floating action button to create a proposal (mirrors BudgetFab).
import * as React from "react";
import { Plus } from "lucide-react";
import { STYLE_TOKENS } from "@/components/mobile/tokens";

interface DaoFabProps {
  onClick: () => void;
  label?: string;
}

export function DaoFab({ onClick, label = "New proposal" }: DaoFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${STYLE_TOKENS.fab} text-xl font-bold`}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
