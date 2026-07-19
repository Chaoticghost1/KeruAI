// client/src/components/dao/VoteBar.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VoteBar } from "./VoteBar";
import type { DaoProposalTally } from "@/hooks/use-dao";

const tally: DaoProposalTally = { for: 6, against: 3, abstain: 1, total: 10 };

describe("VoteBar", () => {
  it("renders the vote counts", () => {
    render(<VoteBar tally={tally} language="en" />);
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders Spanish labels when language is es", () => {
    render(<VoteBar tally={tally} language="es" />);
    expect(screen.getByText("A favor")).toBeInTheDocument();
    expect(screen.getByText("En contra")).toBeInTheDocument();
    expect(screen.getByText("Abstención")).toBeInTheDocument();
  });
});
