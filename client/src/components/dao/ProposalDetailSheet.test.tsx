// client/src/components/dao/ProposalDetailSheet.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProposalDetailSheet } from "./ProposalDetailSheet";
import type { DaoProposal } from "@/hooks/use-dao";

const active: DaoProposal = {
  id: 1,
  title: "Public WiFi",
  description: "Free internet in the park.",
  category: "Infrastructure",
  authorId: 2,
  status: "active",
  deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tally: { for: 6, against: 3, abstain: 1, total: 10 },
};

describe("ProposalDetailSheet", () => {
  it("renders the proposal description and vote options when open and votable", () => {
    render(
      <ProposalDetailSheet
        proposal={active}
        open
        onOpenChange={() => {}}
        language="en"
        userVote={null}
        canVote
        onVote={() => {}}
      />
    );
    expect(screen.getByText("Free internet in the park.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /For/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Against/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Abstain/i })).toBeInTheDocument();
  });

  it("calls onVote with the chosen choice", () => {
    const onVote = vi.fn();
    render(
      <ProposalDetailSheet
        proposal={active}
        open
        onOpenChange={() => {}}
        language="en"
        userVote={null}
        canVote
        onVote={onVote}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Against/i }));
    expect(onVote).toHaveBeenCalledWith("against");
  });

  it("does not render vote options when voting is closed", () => {
    render(
      <ProposalDetailSheet
        proposal={{ ...active, status: "passed", deadline: new Date(Date.now() - 86400000).toISOString() }}
        open
        onOpenChange={() => {}}
        language="en"
        userVote={null}
        canVote={false}
        onVote={() => {}}
      />
    );
    expect(screen.queryByRole("button", { name: /For/i })).toBeNull();
    expect(screen.getByText(/Voting is closed/i)).toBeInTheDocument();
  });
});
