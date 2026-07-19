import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpload, previewFileText, type UploadResult } from "@/hooks/useUpload";
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";

const SUBJECT_OPTIONS = [
  { value: "math", labelEs: "Matemáticas", labelEn: "Mathematics" },
  { value: "physics", labelEs: "Física", labelEn: "Physics" },
  { value: "chemistry", labelEs: "Química", labelEn: "Chemistry" },
  { value: "biology", labelEs: "Biología", labelEn: "Biology" },
  { value: "spanish", labelEs: "Español", labelEn: "Spanish" },
  { value: "english", labelEs: "Inglés", labelEn: "English" },
  { value: "history", labelEs: "Historia", labelEn: "History" },
  { value: "general", labelEs: "General", labelEn: "General" },
];

export default function TeacherUpload() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const upload = useUpload();

  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("math");
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  const isEs = language === "es";
  const t = {
    title: isEs ? "Subir material" : "Upload Material",
    subtitle: isEs
      ? "Sube un PDF, imagen o texto para alimentar la búsqueda RAG del tutor."
      : "Upload a PDF, image, or text file to feed the tutor's RAG retrieval.",
    file: isEs ? "Archivo" : "File",
    subject: isEs ? "Materia" : "Subject",
    topic: isEs ? "Tema (opcional)" : "Topic (optional)",
    grade: isEs ? "Grado (opcional)" : "Grade level (optional)",
    lang: isEs ? "Idioma" : "Language",
    submit: isEs ? "Subir y procesar" : "Upload & process",
    choose: isEs ? "Elegir archivo" : "Choose file",
    preview: isEs ? "Vista previa (texto plano)" : "Plain-text preview",
    success: isEs ? "Material ingerido" : "Material ingested",
    chunks: isEs ? "fragmentos" : "chunks",
    error: isEs ? "Error al subir" : "Upload error",
  };

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setPreview(f ? await previewFileText(f) : "");
  }

  async function onSubmit() {
    if (!file) {
      toast({ title: t.error, description: t.choose, variant: "destructive" });
      return;
    }
    try {
      const res = await upload.mutateAsync({
        file,
        subject,
        topic: topic || undefined,
        gradeLevel: gradeLevel || undefined,
        language: isEs ? "es" : "en",
      });
      setResult(res);
      toast({ title: t.success, description: `${res.chunkCount} ${t.chunks}` });
    } catch (err) {
      toast({
        title: t.error,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">{t.file}</Label>
            <Input id="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.html" onChange={onFileChange} />
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" /> {file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.subject}</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBJECT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {isEs ? s.labelEs : s.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">{t.topic}</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">{t.grade}</Label>
              <Input id="grade" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="1-12" />
            </div>
          </div>

          {preview && (
            <div className="space-y-2">
              <Label>{t.preview}</Label>
              <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap">{preview}</pre>
            </div>
          )}

          <Button onClick={onSubmit} disabled={upload.isPending || !file} className="w-full">
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {t.submit}
          </Button>

          {result && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              {result.message} ({result.chunkCount} {t.chunks})
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
