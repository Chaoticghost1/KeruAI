// client/src/components/mobile/LessonViewer.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { LessonViewer, type Flashcard, type PracticeQuestion } from "./LessonViewer";

const cards: Flashcard[] = [
  { id: 1, front: "¿Qué es una fracción?", back: "Parte de un entero." },
  { id: 2, front: "Suma 1/2 + 1/2", back: "1" },
];
const practice: PracticeQuestion[] = [
  { id: 10, question: "¿Cuánto es 1/2 + 1/2?", options: ["1", "2", "1/4"], answer: "1", explanation: "Suma los numeradores." },
];

describe("LessonViewer (mobile)", () => {
  it("renders the lesson header title and concept pills", () => {
    render(<LessonViewer title="Fracciones" concepts={["Suma", "Resta"]} />);
    expect(screen.getByRole("heading", { level: 1, name: "Fracciones" })).toBeInTheDocument();
    expect(screen.getByLabelText(/conceptos clave/i)).toBeInTheDocument();
  });

  it("shows a summary tab and read-more reveal for long text", () => {
    const long = "a".repeat(300);
    render(<LessonViewer title="T" summary={long} />);
    // collapsed initially (not expanded)
    expect(screen.getByText(/Leer más/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Leer más/i));
    expect(screen.queryByText(/Leer más/i)).not.toBeInTheDocument();
  });

  it("flips a flashcard on tap", () => {
    render(<LessonViewer title="T" flashcards={cards} />);
    fireEvent.click(screen.getByRole("tab", { name: /tarjetas/i }));
    const flip = screen.getByLabelText(/voltear a la respuesta/i);
    expect(flip).toHaveTextContent("¿Qué es una fracción?");
    fireEvent.click(screen.getByRole("button", { name: /voltear$/i }));
    expect(screen.getByLabelText(/voltear a la pregunta/i)).toHaveTextContent("Parte de un entero.");
  });

  it("records a review when answering practice correctly", () => {
    const onReview = vi.fn();
    render(<LessonViewer title="T" practice={practice} onReview={onReview} />);
    fireEvent.click(screen.getByRole("tab", { name: /práctica/i }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onReview).toHaveBeenCalledWith(10, "easy");
  });

  it("navigates between flashcards", () => {
    render(<LessonViewer title="T" flashcards={cards} />);
    fireEvent.click(screen.getByRole("tab", { name: /tarjetas/i }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/siguiente tarjeta/i));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });
});
