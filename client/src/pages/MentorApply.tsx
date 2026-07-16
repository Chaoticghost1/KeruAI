import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/PublicLayout";
import { PublicNav } from "@/components/PublicNav";
import { GraduationCap, ArrowLeft, CheckCircle, Loader2, Heart } from "lucide-react";

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

const CITY_OPTIONS = [
  "Tegucigalpa",
  "San Pedro Sula",
  "La Ceiba",
  "Choloma",
  "El Progreso",
  "Other",
];

export default function MentorApply() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    subjects: [] as string[],
    credentials: "",
    experience: "",
    hourlyRate: "0",
    gradeLevel: "",
    availability: "",
  });

  const t = {
    title: language === "es" ? "Ser Mentor" : "Become a Mentor",
    subtitle: language === "es"
      ? "Completa el formulario. Revisaremos tus credenciales y diplomas antes de aprobar."
      : "Fill out the form. We will review your credentials and diplomas before approving.",
    fullName: language === "es" ? "Nombre completo" : "Full name",
    email: language === "es" ? "Correo electrónico" : "Email",
    phone: language === "es" ? "Teléfono (WhatsApp)" : "Phone (WhatsApp)",
    city: language === "es" ? "Ciudad" : "City",
    subjects: language === "es" ? "Materias que enseñas" : "Subjects you teach",
    credentials: language === "es" ? "Credenciales y diplomas" : "Credentials and diplomas",
    credentialsPlaceholder: language === "es"
      ? "Describe tu formación académica, títulos, certificaciones..."
      : "Describe your education, degrees, certifications...",
    experience: language === "es" ? "Experiencia" : "Experience",
    experiencePlaceholder: language === "es"
      ? "Años de experiencia, antecedentes docentes..."
      : "Years of experience, teaching background...",
    hourlyRate: language === "es" ? "Tarifa por hora (L)" : "Hourly rate (L)",
    volunteerNote: "0 = Volunteer",
    gradeLevel: language === "es" ? "Nivel máximo que enseñas" : "Max grade level you teach",
    availability: language === "es" ? "Disponibilidad" : "Availability",
    submit: language === "es" ? "Enviar solicitud" : "Submit application",
    success: language === "es"
      ? "Solicitud enviada. Te contactaremos después de revisar tus credenciales."
      : "Application submitted. We will contact you after reviewing your credentials.",
    backToLanding: language === "es" ? "Volver al inicio" : "Back to home",
  };

  const toggleSubject = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(value)
        ? prev.subjects.filter((s) => s !== value)
        : [...prev.subjects, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      toast({ variant: "destructive", title: language === "es" ? "Selecciona al menos una materia" : "Select at least one subject" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/mentorship/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          subjects: formData.subjects,
          credentials: formData.credentials || undefined,
          experience: formData.experience || undefined,
          hourlyRate: formData.hourlyRate || "0",
          gradeLevel: formData.gradeLevel ? parseInt(formData.gradeLevel) : undefined,
          availability: formData.availability || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit");
      }
      setSubmitted(true);
      toast({ title: t.success });
    } catch (err) {
      toast({
        variant: "destructive",
        title: language === "es" ? "Error al enviar" : "Error submitting",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <PublicNav variant="back" backLabel={t.backToLanding} />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
          <Card className="max-w-md w-full border border-youth-muted/50 shadow-xl rounded-youth-lg bg-card">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="h-16 w-16 rounded-full bg-youth-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-youth-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {language === "es" ? "¡Solicitud enviada!" : "Application submitted!"}
              </h2>
              <p className="text-muted-foreground mb-6">{t.success}</p>
              <Link href="/">
                <Button variant="outline" className="rounded-youth-lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.backToLanding}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PublicNav variant="back" backLabel={t.backToLanding} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border border-youth-muted/50 shadow-xl rounded-youth-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Heart className="h-6 w-6 mr-2 text-youth-primary" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.fullName} *</Label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t.email} *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.phone}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+504 1234-5678"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t.city}</Label>
                  <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={language === "es" ? "Seleccionar..." : "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {CITY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t.subjects} *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUBJECT_OPTIONS.map((s) => (
                    <Button
                      key={s.value}
                      type="button"
                      variant={formData.subjects.includes(s.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSubject(s.value)}
                    >
                      {language === "es" ? s.labelEs : s.labelEn}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t.credentials}</Label>
                <Textarea
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  placeholder={t.credentialsPlaceholder}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t.experience}</Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder={t.experiencePlaceholder}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>{t.hourlyRate}</Label>
                  <Input
                    type="text"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="0"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">{t.volunteerNote}</p>
                </div>
                <div>
                  <Label>{t.gradeLevel}</Label>
                  <Select value={formData.gradeLevel} onValueChange={(v) => setFormData({ ...formData, gradeLevel: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">{language === "es" ? "9no Grado" : "9th Grade"}</SelectItem>
                      <SelectItem value="12">{language === "es" ? "12vo Grado" : "12th Grade"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.availability}</Label>
                  <Select value={formData.availability} onValueChange={(v) => setFormData({ ...formData, availability: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">{language === "es" ? "Mañanas" : "Mornings"}</SelectItem>
                      <SelectItem value="afternoon">{language === "es" ? "Tardes" : "Afternoons"}</SelectItem>
                      <SelectItem value="evening">{language === "es" ? "Noches" : "Evenings"}</SelectItem>
                      <SelectItem value="weekends">{language === "es" ? "Fines de semana" : "Weekends"}</SelectItem>
                      <SelectItem value="flexible">{language === "es" ? "Flexible" : "Flexible"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full py-6" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Heart className="h-5 w-5 mr-2" />}
                {t.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
