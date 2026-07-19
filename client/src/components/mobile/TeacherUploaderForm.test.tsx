// client/src/components/mobile/TeacherUploaderForm.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeacherUploaderForm } from "./TeacherUploaderForm";

describe("TeacherUploaderForm (mobile)", () => {
  it("renders a bottom CTA bar with the primary submit button", () => {
    render(<TeacherUploaderForm onSubmit={vi.fn()} />);
    // The form label + submit button exist
    expect(screen.getByLabelText(/subir material del profesor/i)).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: /subir y procesar/i });
    expect(submit).toBeInTheDocument();
    // bottom CTA bar: fixed positioning utility present on the bar element
    const bar = document.querySelector('[class*="fixed"][class*="bottom-0"]');
    expect(bar).not.toBeNull();
    expect(bar?.className).toContain("fixed");
  });

  it("disables submit until a file or pasted text is provided", () => {
    render(<TeacherUploaderForm onSubmit={vi.fn()} />);
    const submit = screen.getByRole("button", { name: /subir y procesar/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    const paste = screen.getByLabelText(/o pega el texto/i);
    fireEvent.change(paste, { target: { value: "Fracciones: suma y resta" } });
    expect(submit.disabled).toBe(false);
  });

  it("announces upload progress via role=progressbar", () => {
    render(<TeacherUploaderForm onSubmit={vi.fn()} progress={42} />);
    const pb = screen.getByRole("progressbar");
    expect(pb).toHaveAttribute("aria-valuenow", "42");
  });

  it("shows chunkCount success message after upload", () => {
    render(<TeacherUploaderForm onSubmit={vi.fn()} chunkCount={8} />);
    expect(screen.getByText(/8 fragmentos/i)).toBeInTheDocument();
  });

  it("always has >=44px tap targets on the primary button", () => {
    render(<TeacherUploaderForm onSubmit={vi.fn()} />);
    const submit = screen.getByRole("button", { name: /subir y procesar/i });
    expect(submit.className).toContain("min-h-[44px]");
  });
});
