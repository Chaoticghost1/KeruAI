// client/src/components/dao/ProposalForm.tsx
// Form to create a DAO proposal (bottom-sheet style).
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CreateProposalInput } from "@/hooks/use-dao";

interface ProposalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: "es" | "en";
  onSubmit: (data: CreateProposalInput) => void;
  isSubmitting?: boolean;
}

export function ProposalForm({ open, onOpenChange, language, onSubmit, isSubmitting }: ProposalFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState(
    language === "es" ? "General" : "General"
  );
  const [deadline, setDeadline] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setCategory("General");
      setDeadline("");
    }
  }, [open]);

  const canSubmit = title.trim() && description.trim() && deadline;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || "General",
      deadline: new Date(deadline).toISOString(),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader>
          <SheetTitle>
            {language === "es" ? "Nueva propuesta" : "New proposal"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proposal-title">{language === "es" ? "Título" : "Title"}</Label>
            <Input
              id="proposal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === "es" ? "Ej. Instalar WiFi público" : "e.g. Install public WiFi"}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proposal-desc">{language === "es" ? "Descripción" : "Description"}</Label>
            <Textarea
              id="proposal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proposal-cat">{language === "es" ? "Categoría" : "Category"}</Label>
              <Input
                id="proposal-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-deadline">{language === "es" ? "Vence" : "Deadline"}</Label>
              <Input
                id="proposal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <SheetFooter className="mt-2 flex-row gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (language === "es" ? "Publicando…" : "Posting…") : language === "es" ? "Publicar" : "Publish"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
