import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Star, Clock, MessageSquare, Award, Heart, BookOpen, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/currency-formatter';

export default function MentorshipHub() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('find-mentor');

  // Honduras-first: Mock mentors with local context
  const availableMentors = [
    {
      id: 1,
      name: "María Rodríguez",
      avatar: "",
      bio: "Profesora de matemáticas con 8 años de experiencia en Tegucigalpa",
      subjects: ["Matemáticas", "Álgebra", "Geometría"],
      rating: 4.9,
      totalRatings: 127,
      hoursVolunteered: 234,
      responseTime: 2,
      hourlyRate: 0, // Volunteer
      gradeLevel: 9,
      languages: ["es"],
      isVerified: true,
      isAvailable: true
    },
    {
      id: 2,
      name: "Carlos Mejía",
      avatar: "",
      bio: "Estudiante universitario de ingeniería, especialista en ciencias",
      subjects: ["Física", "Química", "Biología"],
      rating: 4.7,
      totalRatings: 89,
      hoursVolunteered: 156,
      responseTime: 4,
      hourlyRate: 25, // L 25 per hour
      gradeLevel: 11,
      languages: ["es", "en"],
      isVerified: true,
      isAvailable: true
    },
    {
      id: 3,
      name: "Ana Castillo",
      avatar: "",
      bio: "Especialista en literatura y escritura, graduada de UNAH",
      subjects: ["Español", "Literatura", "Redacción"],
      rating: 4.8,
      totalRatings: 156,
      hoursVolunteered: 298,
      responseTime: 1,
      hourlyRate: 0, // Volunteer
      gradeLevel: 12,
      languages: ["es"],
      isVerified: true,
      isAvailable: true
    }
  ];

  const mentorshipRequests = [
    {
      id: 1,
      student: "José García",
      subject: "Matemáticas",
      description: "Necesito ayuda con ecuaciones cuadráticas para mi examen",
      urgency: "high",
      requestedAt: "2 horas"
    },
    {
      id: 2,
      student: "Sofía López",
      subject: "Física",
      description: "Problemas con movimiento rectilíneo uniforme",
      urgency: "normal",
      requestedAt: "5 horas"
    }
  ];

  const renderMentorCard = (mentor: any) => (
    <Card key={mentor.id} className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {mentor.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{mentor.name}</h3>
                {mentor.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {t.language === 'es' ? 'Verificado' : 'Verified'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{mentor.rating}</span>
                <span className="text-sm text-gray-500">({mentor.totalRatings})</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {mentor.hourlyRate === 0 
                ? (t.language === 'es' ? 'Voluntario' : 'Volunteer')
                : formatCurrency(mentor.hourlyRate, 'HNL', t.language)
              }
            </div>
            <div className="text-xs text-gray-500">
              {t.language === 'es' ? 'por hora' : 'per hour'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3">{mentor.bio}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-1">
            {mentor.subjects.map((subject: string) => (
              <Badge key={subject} variant="outline" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{mentor.responseTime}h {t.language === 'es' ? 'respuesta' : 'response'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{mentor.hoursVolunteered}h {t.language === 'es' ? 'voluntariado' : 'volunteer'}</span>
              </div>
            </div>
            <div className="flex space-x-1">
              {mentor.languages.map((lang: string) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang === 'es' ? 'ESP' : 'ENG'}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-testid={`button-request-mentor-${mentor.id}`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t.language === 'es' ? 'Solicitar Ayuda' : 'Request Help'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            data-testid={`button-view-profile-${mentor.id}`}
          >
            {t.language === 'es' ? 'Ver Perfil' : 'View Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.language === 'es' ? '🤝 Centro de Mentores' : '🤝 Mentorship Hub'}
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
                      <SelectTrigger data-testid="select-subject">
                        <SelectValue placeholder={t.language === 'es' ? 'Materia' : 'Subject'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">
                          {t.language === 'es' ? 'Matemáticas' : 'Mathematics'}
                        </SelectItem>
                        <SelectItem value="science">
                          {t.language === 'es' ? 'Ciencias' : 'Science'}
                        </SelectItem>
                        <SelectItem value="language">
                          {t.language === 'es' ? 'Español' : 'Spanish'}
                        </SelectItem>
                        <SelectItem value="english">
                          {t.language === 'es' ? 'Inglés' : 'English'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger data-testid="select-grade">
                        <SelectValue placeholder={t.language === 'es' ? 'Grado' : 'Grade'} />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={`${i + 1}`}>
                            {t.language === 'es' ? `${i + 1}° Grado` : `Grade ${i + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger data-testid="select-availability">
                        <SelectValue placeholder={t.language === 'es' ? 'Disponibilidad' : 'Availability'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">
                          {t.language === 'es' ? 'Ahora' : 'Now'}
                        </SelectItem>
                        <SelectItem value="today">
                          {t.language === 'es' ? 'Hoy' : 'Today'}
                        </SelectItem>
                        <SelectItem value="week">
                          {t.language === 'es' ? 'Esta Semana' : 'This Week'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger data-testid="select-price">
                        <SelectValue placeholder={t.language === 'es' ? 'Precio' : 'Price'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">
                          {t.language === 'es' ? 'Voluntario (Gratis)' : 'Volunteer (Free)'}
                        </SelectItem>
                        <SelectItem value="paid">
                          {t.language === 'es' ? 'Pago en Lempiras' : 'Paid in Lempiras'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableMentors.map(renderMentorCard)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="become-mentor">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.language === 'es' ? 'Conviértete en Mentor' : 'Become a Mentor'}
                </CardTitle>
                <p className="text-gray-600">
                  {t.language === 'es' 
                    ? 'Ayuda a otros estudiantes hondureños y gana experiencia en enseñanza'
                    : 'Help fellow Honduran students and gain teaching experience'
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t.language === 'es' ? 'Materias que puedes enseñar' : 'Subjects you can teach'}
                    </label>
                    <div className="space-y-2">
                      {['Matemáticas', 'Ciencias', 'Español', 'Inglés', 'Historia', 'Geografía'].map(subject => (
                        <label key={subject} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        {t.language === 'es' ? 'Grado máximo' : 'Maximum grade level'}
                      </label>
                      <Select>
                        <SelectTrigger data-testid="select-max-grade">
                          <SelectValue placeholder={t.language === 'es' ? 'Seleccionar grado' : 'Select grade'} />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}`}>
                              {t.language === 'es' ? `${i + 1}° Grado` : `Grade ${i + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">
                        {t.language === 'es' ? 'Tarifa por hora (Lempiras, 0 para voluntario)' : 'Hourly rate (Lempiras, 0 for volunteer)'}
                      </label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min="0"
                        data-testid="input-hourly-rate"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">
                    {t.language === 'es' ? 'Biografía' : 'Bio'}
                  </label>
                  <Textarea 
                    placeholder={t.language === 'es' 
                      ? 'Cuéntanos sobre tu experiencia y método de enseñanza...'
                      : 'Tell us about your experience and teaching approach...'
                    }
                    rows={4}
                    data-testid="textarea-bio"
                  />
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-apply-mentor">
                  {t.language === 'es' ? 'Aplicar como Mentor' : 'Apply as Mentor'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-sessions">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {t.language === 'es' ? 'Sesiones Completadas' : 'Completed Sessions'}
                        </p>
                        <p className="text-3xl font-bold text-blue-600">12</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {t.language === 'es' ? 'Horas de Aprendizaje' : 'Learning Hours'}
                        </p>
                        <p className="text-3xl font-bold text-green-600">24</p>
                      </div>
                      <Clock className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {t.language === 'es' ? 'Puntos Ganados' : 'Points Earned'}
                        </p>
                        <p className="text-3xl font-bold text-purple-600">360</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t.language === 'es' ? 'Próximas Sesiones' : 'Upcoming Sessions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    {t.language === 'es' 
                      ? 'No tienes sesiones programadas. ¡Solicita ayuda de un mentor!'
                      : 'No scheduled sessions. Request help from a mentor!'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.language === 'es' ? 'Foro de la Comunidad' : 'Community Forum'}
                </CardTitle>
                <p className="text-gray-600">
                  {t.language === 'es' 
                    ? 'Comparte preguntas, consejos y celebra logros con otros estudiantes hondureños'
                    : 'Share questions, tips, and celebrate achievements with fellow Honduran students'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <Button className="mb-4" data-testid="button-new-post">
                  {t.language === 'es' ? 'Nueva Publicación' : 'New Post'}
                </Button>
                
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {t.language === 'es' ? '¿Ayuda con fracciones?' : 'Help with fractions?'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {t.language === 'es' 
                              ? 'Necesito ayuda para entender la suma de fracciones con diferente denominador...'
                              : 'I need help understanding how to add fractions with different denominators...'
                            }
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Luis Hernández</span>
                            <span>hace 2 horas</span>
                            <Badge variant="outline" className="text-xs">Matemáticas</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600">3 respuestas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {t.language === 'es' ? '¡Logré pasar mi examen de química!' : 'I passed my chemistry exam!'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {t.language === 'es' 
                              ? 'Gracias a la ayuda de mi mentor María, finalmente entendí los enlaces químicos...'
                              : 'Thanks to my mentor María\'s help, I finally understood chemical bonds...'
                            }
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Carmen Flores</span>
                            <span>hace 1 día</span>
                            <Badge variant="outline" className="text-xs">Logro</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-red-600">❤️ 12</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}