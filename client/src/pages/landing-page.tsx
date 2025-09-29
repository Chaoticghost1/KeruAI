import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award, 
  Brain, 
  Shield, 
  Zap,
  FileText,
  MessageSquare,
  TrendingUp,
  Lock,
  CheckCircle,
  ArrowRight,
  Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Keru.ai
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Comenzar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              🤖 Tutorías con IA
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Tu plataforma educativa integral
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Descubre Keru.ai, la plataforma educativa diseñada específicamente para Honduras. 
              Tutorías con IA, gestión de contenido y experiencias de aprendizaje gamificadas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Comenzar Ahora
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Ver Demo
              </Button>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Para Estudiantes</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Aprende con tutores de IA personalizados y sistemas de progreso gamificados
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Para Profesores</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Crea y gestiona contenido educativo con herramientas avanzadas
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Para Administradores</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Panel completo de administración y análisis de la plataforma
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Todo lo que necesitas para una experiencia educativa completa y moderna
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Tutores IA Personalizados</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Asistentes de IA especializados en diferentes materias para ayuda personalizada
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Sistema de Recompensas</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Badges, niveles y logros para mantener la motivación en el aprendizaje
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Gestión de Contenido</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Herramientas completas para crear, organizar y compartir material educativo
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Chat Inteligente</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sistema de chat con IA para resolución de dudas en tiempo real
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Análisis de Progreso</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Seguimiento detallado del rendimiento y áreas de mejora
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Acceso Offline</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Funcionalidad offline para estudiar sin conexión a internet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Listo para comenzar tu aventura educativa?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes y profesores que ya están transformando su experiencia educativa con Keru.ai
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
              <CheckCircle className="mr-2 h-5 w-5" />
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Keru.ai</span>
              </div>
              <p className="text-gray-300">
                Transformando la educación en Honduras con tecnología de IA
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/auth" className="hover:text-white">Estudiantes</Link></li>
                <li><Link href="/auth" className="hover:text-white">Profesores</Link></li>
                <li><Link href="/auth" className="hover:text-white">Administradores</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Herramientas</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/auth" className="hover:text-white">Study Buddy</Link></li>
                <li><Link href="/auth" className="hover:text-white">Budget Pal</Link></li>
                <li><Link href="/auth" className="hover:text-white">Chat IA</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Keru.ai. Diseñado para la educación en Honduras.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}