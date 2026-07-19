// client/src/components/dao/ProposalCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProposalCard } from "./ProposalCard";
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

const closed: DaoProposal = { ...active, id: 2, status: "passed", deadline: new Date(Date.now() - 86400000).toISOString() };

describe("ProposalCard", () => {
  it("renders title, category and tally", () => {
    render(<ProposalCard proposal={active} language="en" onOpen={() => {}} />);
    expect(screen.getByText("Public WiFi")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("shows a Vote button when active and calls onOpen", () => {
    const onOpen = vi.fn();
    render(<ProposalCard proposal={active} language="en" onOpen={onOpen} />);
    fireEvent.click(screen.getByText("Vote"));
    expect(onOpen).toHaveBeenCalledWith(active);
  });

  it("hides the Vote button when not active", () => {
    render(<ProposalCard proposal={closed} language="en" onOpen={() => {}} />);
    expect(screen.queryByText("Vote")).toBeNull();
  });

  it("shows a Close button for teachers when active", () => {
    const onClose = vi.fn();
    render(
      <ProposalCard proposal={active} language="en" onOpen={() => {}} isTeacherOrSuperuser onClose={onClose} />
    );
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledWith(1);
  });
});
