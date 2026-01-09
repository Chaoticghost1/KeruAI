import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Star, Clock, MessageSquare, Award, Heart, BookOpen, TrendingUp, 
  Video, Calendar, Search, Filter, CheckCircle, MapPin, GraduationCap,
  Sparkles, Crown, Zap, Globe, DollarSign, ArrowRight, UserCheck, 
  Target, Trophy, Briefcase, Mail, Phone
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MentorshipHub() {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

  const [mentorFormData, setMentorFormData] = useState({
    subjects: '',
    bio: '',
    gradeLevel: '',
    hourlyRate: '',
    availability: '',
    experience: ''
  });

  const t = {
    title: language === 'es' ? 'Centro de Mentores' : 'Mentorship Hub',
    subtitle: language === 'es' 
      ? 'Conecta con profesores hondureños certificados para tutorías personalizadas 1:1'
      : 'Connect with certified Honduran teachers for personalized 1:1 tutoring',
    findMentor: language === 'es' ? 'Buscar Mentor' : 'Find Mentor',
    becomeMentor: language === 'es' ? 'Ser Mentor' : 'Become Mentor',
    mySessions: language === 'es' ? 'Mis Sesiones' : 'My Sessions',
    community: language === 'es' ? 'Comunidad' : 'Community',
  };

  // Sample mentor data with realistic profiles
  const sampleMentors = [
    {
      id: 1,
      name: 'Prof. María Rodríguez',
      subjects: ['Matemáticas', 'Física'],
      rating: 4.9,
      reviews: 156,
      sessions: 340,
      hourlyRate: 150,
      location: 'Tegucigalpa',
      verified: true,
      experience: '12 años',
      availability: 'Lun-Vie 2pm-8pm',
      image: '👩‍🏫',
      badge: 'Top Mentor',
      bio: 'Ingeniera con maestría en educación. Especializada en preparación universitaria.'
    },
    {
      id: 2,
      name: 'Lic. Carlos Mejía',
      subjects: ['Química', 'Biología'],
      rating: 4.8,
      reviews: 98,
      sessions: 210,
      hourlyRate: 0,
      location: 'San Pedro Sula',
      verified: true,
      experience: '8 años',
      availability: 'Sáb-Dom 10am-4pm',
      image: '👨‍🔬',
      badge: 'Voluntario',
      bio: 'Químico farmacéutico apasionado por enseñar ciencias a jóvenes.'
    },
    {
      id: 3,
      name: 'Profa. Ana Castillo',
      subjects: ['Español', 'Literatura'],
      rating: 5.0,
      reviews: 203,
      sessions: 450,
      hourlyRate: 120,
      location: 'La Ceiba',
      verified: true,
      experience: '15 años',
      availability: 'Lun-Sáb 9am-6pm',
      image: '👩‍💼',
      badge: 'Elite',
      bio: 'Licenciada en Letras. Preparación para exámenes de admisión.'
    }
  ];

  const stats = [
    { icon: Users, value: '247', label: language === 'es' ? 'Mentores Activos' : 'Active Mentors', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Clock, value: '12,450', label: language === 'es' ? 'Horas Completadas' : 'Hours Completed', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Star, value: '4.9', label: language === 'es' ? 'Calificación Promedio' : 'Average Rating', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: GraduationCap, value: '1,850', label: language === 'es' ? 'Estudiantes Ayudados' : 'Students Helped', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-200/60 backdrop-blur-2xl bg-white/70 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-xs text-slate-500">{t.subtitle}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              >
                {language === 'es' ? '🇺🇸 EN' : '🇭🇳 ES'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Hero Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardContent className="p-2">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1 rounded-xl">
                  <TabsTrigger value="find-mentor" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.findMentor}</span>
                  </TabsTrigger>
                  <TabsTrigger value="become-mentor" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.becomeMentor}</span>
                  </TabsTrigger>
                  <TabsTrigger value="my-sessions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.mySessions}</span>
                  </TabsTrigger>
                  <TabsTrigger value="community" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.community}</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            {/* Find Mentor Tab */}
            <TabsContent value="find-mentor" className="space-y-6">
              {/* Search & Filters */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="mr-2 h-5 w-5 text-blue-600" />
                    {language === 'es' ? 'Encuentra tu Mentor Ideal' : 'Find Your Ideal Mentor'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-3">
                    <Input 
                      placeholder={language === 'es' ? '🔍 Buscar por nombre...' : '🔍 Search by name...'}
                      className="bg-slate-50 border-slate-200"
                    />
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={language === 'es' ? 'Materia' : 'Subject'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">📐 {language === 'es' ? 'Matemáticas' : 'Mathematics'}</SelectItem>
                        <SelectItem value="physics">⚛️ {language === 'es' ? 'Física' : 'Physics'}</SelectItem>
                        <SelectItem value="chemistry">🧪 {language === 'es' ? 'Química' : 'Chemistry'}</SelectItem>
                        <SelectItem value="spanish">📖 {language === 'es' ? 'Español' : 'Spanish'}</SelectItem>
                        <SelectItem value="english">🇬🇧 {language === 'es' ? 'Inglés' : 'English'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={language === 'es' ? 'Grado' : 'Grade'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7-9">{language === 'es' ? '7mo-9no Grado' : '7th-9th Grade'}</SelectItem>
                        <SelectItem value="10-12">{language === 'es' ? '10mo-12vo Grado' : '10th-12th Grade'}</SelectItem>
                        <SelectItem value="university">{language === 'es' ? 'Universidad' : 'University'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder={language === 'es' ? 'Precio' : 'Price'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">💚 {language === 'es' ? 'Gratis' : 'Free'}</SelectItem>
                        <SelectItem value="paid">💵 {language === 'es' ? 'De Pago' : 'Paid'}</SelectItem>
                        <SelectItem value="all">🎯 {language === 'es' ? 'Todos' : 'All'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white border-0">
                      <Search className="h-4 w-4 mr-2" />
                      {language === 'es' ? 'Buscar' : 'Search'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mentor Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleMentors.map((mentor) => (
                  <Card key={mentor.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-6 relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-5xl">{mentor.image}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-slate-900">{mentor.name}</h3>
                              {mentor.verified && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold text-slate-900">{mentor.rating}</span>
                              <span className="text-xs text-slate-500">({mentor.reviews})</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${mentor.hourlyRate === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} border-0`}>
                          {mentor.badge}
                        </Badge>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mentor.bio}</p>

                      {/* Subjects */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.subjects.map((subject, i) => (
                          <Badge key={i} className="bg-slate-100 text-slate-700 border-0 text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">{language === 'es' ? 'Experiencia' : 'Experience'}</p>
                          <p className="text-sm font-semibold text-slate-900">{mentor.experience}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">{language === 'es' ? 'Sesiones' : 'Sessions'}</p>
                          <p className="text-sm font-semibold text-slate-900">{mentor.sessions}</p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-slate-600">
                          <MapPin className="h-3 w-3 mr-2 text-slate-400" />
                          {mentor.location}
                        </div>
                        <div className="flex items-center text-xs text-slate-600">
                          <Clock className="h-3 w-3 mr-2 text-slate-400" />
                          {mentor.availability}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          {mentor.hourlyRate === 0 ? (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              <Heart className="h-3 w-3 mr-1" />
                              {language === 'es' ? 'Voluntario' : 'Volunteer'}
                            </Badge>
                          ) : (
                            <div>
                              <span className="text-2xl font-bold text-slate-900">L{mentor.hourlyRate}</span>
                              <span className="text-xs text-slate-500">/hora</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                          <Video className="h-4 w-4 mr-2" />
                          {language === 'es' ? 'Reservar' : 'Book'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Become Mentor Tab */}
            <TabsContent value="become-mentor">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Benefits Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white lg:col-span-1">
                  <CardContent className="p-6">
                    <Crown className="h-12 w-12 mb-4 text-yellow-300" />
                    <h3 className="text-xl font-bold mb-4">
                      {language === 'es' ? '¿Por qué ser mentor?' : 'Why become a mentor?'}
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{language === 'es' ? 'Comparte tu conocimiento y ayuda estudiantes' : 'Share your knowledge and help students'}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{language === 'es' ? 'Define tu horario y tarifa' : 'Set your own schedule and rate'}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{language === 'es' ? 'Trabaja desde casa' : 'Work from home'}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{language === 'es' ? 'Acceso a herramientas educativas IA' : 'Access to AI educational tools'}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{language === 'es' ? 'Comunidad de educadores' : 'Educator community'}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Application Form */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-500" />
                      {language === 'es' ? 'Solicitud de Mentor' : 'Mentor Application'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Nombre completo' : 'Full name'}
                        </label>
                        <Input 
                          placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Correo electrónico' : 'Email'}
                        </label>
                        <Input 
                          type="email"
                          placeholder="ejemplo@correo.com"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Teléfono (WhatsApp)' : 'Phone (WhatsApp)'}
                        </label>
                        <Input 
                          placeholder="+504 1234-5678"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Ciudad' : 'City'}
                        </label>
                        <Select>
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue placeholder={language === 'es' ? 'Seleccionar...' : 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tegucigalpa">Tegucigalpa</SelectItem>
                            <SelectItem value="sps">San Pedro Sula</SelectItem>
                            <SelectItem value="ceiba">La Ceiba</SelectItem>
                            <SelectItem value="choloma">Choloma</SelectItem>
                            <SelectItem value="progreso">El Progreso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700">
                        {language === 'es' ? 'Materias que enseñas' : 'Subjects you teach'}
                      </label>
                      <Input 
                        placeholder={language === 'es' ? 'Ej: Matemáticas, Física, Química' : 'Ex: Math, Physics, Chemistry'}
                        value={mentorFormData.subjects}
                        onChange={(e) => setMentorFormData({...mentorFormData, subjects: e.target.value})}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700">
                        {language === 'es' ? 'Experiencia y certificaciones' : 'Experience and certifications'}
                      </label>
                      <Textarea 
                        placeholder={language === 'es' ? 'Describe tu formación académica, años de experiencia, certificaciones...' : 'Describe your education, years of experience, certifications...'}
                        value={mentorFormData.bio}
                        onChange={(e) => setMentorFormData({...mentorFormData, bio: e.target.value})}
                        rows={4}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Nivel máximo' : 'Max level'}
                        </label>
                        <Select onValueChange={(v) => setMentorFormData({...mentorFormData, gradeLevel: v})}>
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue placeholder={language === 'es' ? 'Seleccionar...' : 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">{language === 'es' ? '9no Grado' : '9th Grade'}</SelectItem>
                            <SelectItem value="12">{language === 'es' ? '12vo Grado' : '12th Grade'}</SelectItem>
                            <SelectItem value="university">{language === 'es' ? 'Universidad' : 'University'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Tarifa/hora (L)' : 'Rate/hour (L)'}
                        </label>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={mentorFormData.hourlyRate}
                          onChange={(e) => setMentorFormData({...mentorFormData, hourlyRate: e.target.value})}
                          className="bg-slate-50 border-slate-200"
                        />
                        <p className="text-xs text-slate-500 mt-1">0 = Voluntario</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                          {language === 'es' ? 'Disponibilidad' : 'Availability'}
                        </label>
                        <Select>
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue placeholder={language === 'es' ? 'Horario...' : 'Schedule...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">{language === 'es' ? 'Mañanas' : 'Mornings'}</SelectItem>
                            <SelectItem value="afternoon">{language === 'es' ? 'Tardes' : 'Afternoons'}</SelectItem>
                            <SelectItem value="evening">{language === 'es' ? 'Noches' : 'Evenings'}</SelectItem>
                            <SelectItem value="weekends">{language === 'es' ? 'Fines de semana' : 'Weekends'}</SelectItem>
                            <SelectItem value="flexible">{language === 'es' ? 'Flexible' : 'Flexible'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 text-white border-0 py-6 text-lg">
                      <Heart className="h-5 w-5 mr-2" />
                      {language === 'es' ? 'Enviar Solicitud' : 'Submit Application'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* My Sessions Tab */}
            <TabsContent value="my-sessions">
              <div className="space-y-6">
                {/* Upcoming Sessions */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                        {language === 'es' ? 'Sesiones Próximas' : 'Upcoming Sessions'}
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                        <Video className="h-4 w-4 mr-2" />
                        {language === 'es' ? 'Nueva Sesión' : 'New Session'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-10 w-10 text-blue-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        {language === 'es' ? 'No hay sesiones programadas' : 'No sessions scheduled'}
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        {language === 'es' 
                          ? 'Reserva tu primera sesión con un mentor' 
                          : 'Book your first session with a mentor'}
                      </p>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                        {language === 'es' ? 'Buscar Mentores' : 'Find Mentors'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Session History */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-slate-600" />
                      {language === 'es' ? 'Historial de Sesiones' : 'Session History'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">
                        {language === 'es' 
                          ? 'El historial de tus sesiones aparecerá aquí' 
                          : 'Your session history will appear here'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-6">
              {/* Leaderboard */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 flex items-center">
                        <Trophy className="h-7 w-7 mr-2" />
                        {language === 'es' ? 'Tabla de Líderes' : 'Leaderboard'}
                      </h3>
                      <p className="text-white/90">
                        {language === 'es' 
                          ? 'Los mejores mentores del mes según calificaciones y sesiones' 
                          : 'Top mentors of the month by ratings and sessions'}
                      </p>
                    </div>
                    <div className="text-6xl">🏆</div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Mentors */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { rank: 1, name: 'Prof. María Rodríguez', sessions: 340, rating: 4.9, badge: '🥇', color: 'from-yellow-400 to-yellow-600' },
                  { rank: 2, name: 'Profa. Ana Castillo', sessions: 450, rating: 5.0, badge: '🥈', color: 'from-slate-300 to-slate-500' },
                  { rank: 3, name: 'Lic. Carlos Mejía', sessions: 210, rating: 4.8, badge: '🥉', color: 'from-orange-400 to-orange-600' },
                ].map((mentor) => (
                  <Card key={mentor.rank} className="border-0 shadow-xl bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${mentor.color} flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg`}>
                        {mentor.badge}
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{mentor.name}</h4>
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{mentor.rating}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {mentor.sessions} {language === 'es' ? 'sesiones' : 'sessions'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Community Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                  <CardContent className="p-5 text-center">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">247</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es' ? 'Mentores Activos' : 'Active Mentors'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                  <CardContent className="p-5 text-center">
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">12,450</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es' ? 'Horas Totales' : 'Total Hours'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                  <CardContent className="p-5 text-center">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">1,850</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es' ? 'Estudiantes' : 'Students'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                  <CardContent className="p-5 text-center">
                    <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">4.9</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es' ? 'Calificación Avg.' : 'Avg. Rating'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Success Stories */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                    {language === 'es' ? 'Historias de Éxito' : 'Success Stories'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      student: 'María G.',
                      story: language === 'es' 
                        ? 'Pasé de 65 a 95 en matemáticas gracias a las sesiones con Prof. Rodríguez. ¡Increíble!' 
                        : 'Went from 65 to 95 in math thanks to sessions with Prof. Rodríguez. Amazing!',
                      subject: 'Matemáticas',
                      improvement: '+30pts'
                    },
                    {
                      student: 'Carlos M.',
                      story: language === 'es'
                        ? 'Las explicaciones de química son claras y fáciles de entender. Aprobé mi examen de admisión.'
                        : 'Chemistry explanations are clear and easy to understand. I passed my entrance exam.',
                      subject: 'Química',
                      improvement: 'Aprobado'
                    }
                  ].map((story, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{story.student}</p>
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs mt-1">
                            {story.subject}
                          </Badge>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0">
                          {story.improvement}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 italic">"{story.story}"</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA Banner */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
            <CardContent className="p-8 sm:p-12 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white text-center md:text-left">
                  <h3 className="text-3xl font-bold mb-3 flex items-center justify-center md:justify-start">
                    <Zap className="h-8 w-8 mr-2 text-yellow-300" />
                    {language === 'es' ? '¿Listo para aprender?' : 'Ready to learn?'}
                  </h3>
                  <p className="text-lg text-white/90 max-w-2xl">
                    {language === 'es'
                      ? 'Conecta con los mejores profesores de Honduras. Primera sesión con 50% de descuento.'
                      : 'Connect with the best teachers in Honduras. First session with 50% discount.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-2xl border-0 font-semibold whitespace-nowrap">
                    <Video className="h-5 w-5 mr-2" />
                    {language === 'es' ? 'Reservar Sesión' : 'Book Session'}
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold whitespace-nowrap">
                    <Heart className="h-5 w-5 mr-2" />
                    {language === 'es' ? 'Ser Voluntario' : 'Volunteer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}