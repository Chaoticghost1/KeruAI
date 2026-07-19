// client/src/components/mobile/TeacherUploaderForm.tsx
// Canonical mobile-first teacher uploader:
//  - file chooser + paste-text fallback
//  - subject / topic inputs
//  - small preview
//  - submit button with progress indicator
//  - small-screen keyboard handling via useKeyboardSafeView
//
// Accessibility: labeled inputs, 44px tap targets, aria-live progress region,
// file input keyboard-accessible, progress announced to screen readers.

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useKeyboardSafeView } from "./useKeyboardSafeView";
import { STYLE_TOKENS } from "./tokens";
import { Upload, FileText, Loader2, CheckCircle2, X } from "lucide-react";

export interface TeacherUploaderFormProps {
  onSubmit: (payload: {
    file?: File;
    pastedText?: string;
    subject: string;
    topic: string;
    gradeLevel?: string;
  }) => void | Promise<void>;
  /** 0–100 upload progress; undefined = not uploading. */
  progress?: number;
  /** chunkCount returned after a successful upload. */
  chunkCount?: number;
  subjectOptions?: { value: string; label: string }[];
  uploading?: boolean;
  onCancel?: () => void;
  className?: string;
}

const SUBJECTS = [
  { value: "math", label: "Matemáticas" },
  { value: "physics", label: "Física" },
  { value: "biology", label: "Biología" },
  { value: "spanish", label: "Español" },
  { value: "english", label: "Inglés" },
  { value: "history", label: "Historia" },
  { value: "general", label: "General" },
];

export function TeacherUploaderForm({
  onSubmit,
  progress,
  chunkCount,
  subjectOptions = SUBJECTS,
  uploading = false,
  onCancel,
  className,
}: TeacherUploaderFormProps) {
  const kb = useKeyboardSafeView();
  const [file, setFile] = React.useState<File | null>(null);
  const [pastedText, setPastedText] = React.useState("");
  const [subject, setSubject] = React.useState(subjectOptions[0]?.value ?? "general");
  const [topic, setTopic] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const previewText = pastedText.slice(0, 600);
  const busy = uploading || progress !== undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !pastedText.trim()) return;
    await onSubmit({ file: file ?? undefined, pastedText, subject, topic, gradeLevel });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("mx-auto flex w-full max-w-2xl flex-col gap-4 pb-28", className)}
      aria-label="Subir material del profesor"
    >
      {/* File chooser */}
      <div className="space-y-2">
        <Label htmlFor="tu-file" className="text-sm font-medium">
          Archivo (PDF, imagen, texto)
        </Label>
        <input
          ref={fileInputRef}
          id="tu-file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.html"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" aria-hidden /> Elegir archivo
          </Button>
          {file && (
            <span className="flex min-h-[44px] flex-1 items-center gap-2 truncate rounded-md border border-border bg-muted px-3 text-sm">
              <FileText className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label="Quitar archivo"
                className="ml-auto rounded p-1 hover:bg-background"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Paste-text fallback */}
      <div className="space-y-2">
        <Label htmlFor="tu-paste" className="text-sm font-medium">
          O pega el texto
        </Label>
        <Textarea
          id="tu-paste"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Pega aquí el contenido del material…"
          className="min-h-[96px] resize-y text-sm"
        />
      </div>

      {/* Subject / topic / grade */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tu-subject" className="text-sm font-medium">
            Materia
          </Label>
          <select
            id="tu-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {subjectOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tu-grade" className="text-sm font-medium">
            Grado (opcional)
          </Label>
          <Input
            id="tu-grade"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            placeholder="1–12"
            className="min-h-[44px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tu-topic" className="text-sm font-medium">
          Tema (opcional)
        </Label>
        <Input
          id="tu-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej. Fracciones"
          className="min-h-[44px]"
        />
      </div>

      {/* Small preview */}
      {(file || previewText) && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Vista previa</span>
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
            {file ? `📄 ${file.name} (${(file.size / 1024).toFixed(0)} KB)` : previewText || "—"}
          </pre>
        </div>
      )}

      {/* Success state */}
      {chunkCount !== undefined && !busy && (
        <p className="flex items-center gap-2 rounded-md bg-youth-success/10 p-3 text-sm text-youth-success" role="status">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Material ingerido · {chunkCount} fragmentos
        </p>
      )}

      {/* Bottom CTA bar (one-hand reach) */}
      <div
        className={cn(STYLE_TOKENS.bottomCtaBar, kb.isKeyboardOpen && "absolute")}
        style={kb.isKeyboardOpen ? kb.style : undefined}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3" style={kb.isKeyboardOpen ? kb.style : undefined}>
          {busy && onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} className="min-h-[44px]">
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={busy || (!file && !pastedText.trim())}
            className="min-h-[44px] flex-1"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Subiendo…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" aria-hidden /> Subir y procesar
              </>
            )}
          </Button>
        </div>

        {/* Progress indicator (announced) */}
        {progress !== undefined && (
          <div
            className="mx-auto mt-2 w-full max-w-2xl"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de subida"
          >
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn(STYLE_TOKENS.skeleton, "h-full bg-primary transition-all")} style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">{progress}% · se reanuda si se interrumpe</p>
          </div>
        )}
      </div>
    </form>
  );
}

export default TeacherUploaderForm;
