import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Star, Clock, MessageSquare, Award, Heart, BookOpen, TrendingUp } from 'lucide-react';

export default function MentorshipHub() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [mentorFormData, setMentorFormData] = useState({
    subjects: '',
    bio: '',
    gradeLevel: '',
    hourlyRate: ''
  });

  const emptyStateMessage = t.language === 'es' 
    ? 'Los datos se cargarán desde la base de datos cuando estén disponibles.' 
    : 'Data will load from the database when available.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.language === 'es' ? 'Centro de Mentores' : 'Mentorship Hub'}
          </h1>
          <p className="text-xl text-slate-600">
            {t.language === 'es' 
              ? 'Conecta con mentores hondureños para apoyo educativo personalizado'
              : 'Connect with Honduran mentors for personalized educational support'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="find-mentor" data-testid="tab-find-mentor">
              <Users className="h-4 w-4 mr-2" />
              {t.language === 'es' ? 'Buscar Mentor' : 'Find Mentor'}
            </TabsTrigger>
            <TabsTrigger value="become-mentor" data-testid="tab-become-mentor">
              <BookOpen className="h-4 w-4 mr-2" />
              {t.language === 'es' ? 'Ser Mentor' : 'Become Mentor'}
            </TabsTrigger>
            <TabsTrigger value="my-sessions" data-testid="tab-my-sessions">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t.language === 'es' ? 'Mis Sesiones' : 'My Sessions'}
            </TabsTrigger>
            <TabsTrigger value="community" data-testid="tab-community">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t.language === 'es' ? 'Comunidad' : 'Community'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find-mentor">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t.language === 'es' ? 'Filtrar Mentores' : 'Filter Mentors'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t.language === 'es' ? 'Materia' : 'Subject'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">{t.language === 'es' ? 'Matemáticas' : 'Mathematics'}</SelectItem>
                        <SelectItem value="physics">{t.language === 'es' ? 'Física' : 'Physics'}</SelectItem>
                        <SelectItem value="chemistry">{t.language === 'es' ? 'Química' : 'Chemistry'}</SelectItem>
                        <SelectItem value="spanish">{t.language === 'es' ? 'Español' : 'Spanish'}</SelectItem>
                        <SelectItem value="english">{t.language === 'es' ? 'Inglés' : 'English'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t.language === 'es' ? 'Grado' : 'Grade'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">{t.language === 'es' ? '7mo Grado' : '7th Grade'}</SelectItem>
                        <SelectItem value="8">{t.language === 'es' ? '8vo Grado' : '8th Grade'}</SelectItem>
                        <SelectItem value="9">{t.language === 'es' ? '9no Grado' : '9th Grade'}</SelectItem>
                        <SelectItem value="10">{t.language === 'es' ? '10mo Grado' : '10th Grade'}</SelectItem>
                        <SelectItem value="11">{t.language === 'es' ? '11vo Grado' : '11th Grade'}</SelectItem>
                        <SelectItem value="12">{t.language === 'es' ? '12vo Grado' : '12th Grade'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t.language === 'es' ? 'Precio' : 'Price'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">{t.language === 'es' ? 'Gratis (Voluntario)' : 'Free (Volunteer)'}</SelectItem>
                        <SelectItem value="paid">{t.language === 'es' ? 'De Pago' : 'Paid'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      {t.language === 'es' ? 'Buscar' : 'Search'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Users className="h-20 w-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">
                      {t.language === 'es' ? 'No hay mentores disponibles aún' : 'No mentors available yet'}
                    </h3>
                    <p className="text-slate-500">{emptyStateMessage}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="become-mentor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  {t.language === 'es' ? 'Registrarse como Mentor' : 'Register as Mentor'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.language === 'es' ? 'Materias que puedes enseñar' : 'Subjects you can teach'}
                  </label>
                  <Input 
                    placeholder={t.language === 'es' ? 'Ej: Matemáticas, Física, Química' : 'Ex: Math, Physics, Chemistry'}
                    value={mentorFormData.subjects}
                    onChange={(e) => setMentorFormData({...mentorFormData, subjects: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.language === 'es' ? 'Acerca de ti' : 'About you'}
                  </label>
                  <Textarea 
                    placeholder={t.language === 'es' ? 'Describe tu experiencia y cómo puedes ayudar...' : 'Describe your experience and how you can help...'}
                    value={mentorFormData.bio}
                    onChange={(e) => setMentorFormData({...mentorFormData, bio: e.target.value})}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.language === 'es' ? 'Nivel máximo que enseñas' : 'Maximum grade level you teach'}
                    </label>
                    <Select onValueChange={(v) => setMentorFormData({...mentorFormData, gradeLevel: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.language === 'es' ? 'Seleccionar...' : 'Select...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">{t.language === 'es' ? '9no Grado' : '9th Grade'}</SelectItem>
                        <SelectItem value="12">{t.language === 'es' ? '12vo Grado' : '12th Grade'}</SelectItem>
                        <SelectItem value="university">{t.language === 'es' ? 'Universidad' : 'University'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.language === 'es' ? 'Tarifa por hora (L)' : 'Hourly rate (L)'}
                    </label>
                    <Input 
                      type="number" 
                      placeholder={t.language === 'es' ? '0 = Voluntario' : '0 = Volunteer'}
                      value={mentorFormData.hourlyRate}
                      onChange={(e) => setMentorFormData({...mentorFormData, hourlyRate: e.target.value})}
                    />
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Heart className="h-4 w-4 mr-2" />
                  {t.language === 'es' ? 'Registrarme como Mentor' : 'Register as Mentor'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-sessions">
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <MessageSquare className="h-20 w-20 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    {t.language === 'es' ? 'No tienes sesiones activas' : 'No active sessions'}
                  </h3>
                  <p className="text-slate-500">{emptyStateMessage}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">0</h3>
                  <p className="text-slate-500">{t.language === 'es' ? 'Mentores Activos' : 'Active Mentors'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">0</h3>
                  <p className="text-slate-500">{t.language === 'es' ? 'Horas de Mentoría' : 'Mentoring Hours'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">0</h3>
                  <p className="text-slate-500">{t.language === 'es' ? 'Estudiantes Ayudados' : 'Students Helped'}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
