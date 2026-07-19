// client/src/components/mobile/LessonHeader.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonHeader } from "./LessonHeader";

describe("LessonHeader (mobile)", () => {
  it("renders the title and a scrollable concept group", () => {
    render(
      <LessonHeader
        title="Fracciones"
        concepts={["Suma", "Resta", "Equivalentes", "Mixtos"]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Fracciones" })).toBeInTheDocument();
    expect(screen.getByLabelText(/conceptos clave/i)).toBeInTheDocument();
  });

  it("renders a quick-revision CTA that is keyboard reachable", () => {
    const onQuick = () => {};
    render(<LessonHeader title="Tema" onQuickRevision={onQuick} quickRevisionLabel="Repaso rápido" />);
    const cta = screen.getByRole("button", { name: /repaso rápido/i });
    expect(cta).toBeInTheDocument();
  });

  it("shows all concept pills within the scroll group", () => {
    render(<LessonHeader title="T" concepts={["A", "B", "C"]} />);
    const group = screen.getByLabelText(/conceptos clave/i);
    expect(group.querySelectorAll("span")).toHaveLength(3);
  });
});
