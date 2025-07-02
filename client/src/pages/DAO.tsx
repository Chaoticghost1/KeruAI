import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DAO() {
  const { t } = useLanguage();

  const projects = [
    {
      name: "Santa Rush",
      description: {
        es: "Sistema de transporte inteligente para Santa Rita de Copán con rutas optimizadas y pagos digitales.",
        en: "Smart transportation system for Santa Rita de Copán with optimized routes and digital payments."
      },
      status: t.language === 'es' ? 'En desarrollo' : 'In development',
      category: t.language === 'es' ? 'Transporte' : 'Transport',
      icon: 'fas fa-bus'
    },
    {
      name: "Mercado Local DAO",
      description: {
        es: "Plataforma descentralizada para conectar productores locales con consumidores de la región.",
        en: "Decentralized platform to connect local producers with regional consumers."
      },
      status: t.language === 'es' ? 'Planificación' : 'Planning',
      category: t.language === 'es' ? 'Comercio' : 'Commerce',
      icon: 'fas fa-store'
    },
    {
      name: "EcoCredits",
      description: {
        es: "Token de recompensa para acciones sostenibles y proyectos de reforestación comunitaria.",
        en: "Reward token for sustainable actions and community reforestation projects."
      },
      status: t.language === 'es' ? 'Prototipo' : 'Prototype',
      category: t.language === 'es' ? 'Sostenibilidad' : 'Sustainability',
      icon: 'fas fa-leaf'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.santarita.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.santarita.description}
          </p>
        </div>

        {/* Hero Project - Santa Rush */}
        <Card className="mb-8 card-hover bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-2/3 lg:pr-8 mb-6 lg:mb-0">
                <div className="flex items-center mb-4">
                  <i className="fas fa-bus text-4xl mr-4"></i>
                  <h2 className="text-3xl font-bold">Santa Rush</h2>
                </div>
                <p className="text-lg mb-6 opacity-90">
                  {t.language === 'es' 
                    ? 'Revolucionando el transporte público en Santa Rita de Copán con tecnología blockchain y optimización de rutas inteligente.'
                    : 'Revolutionizing public transport in Santa Rita de Copán with blockchain technology and smart route optimization.'
                  }
                </p>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary">
                    {t.language === 'es' ? 'Transporte Sostenible' : 'Sustainable Transport'}
                  </Badge>
                  <Badge variant="secondary">
                    {t.language === 'es' ? 'Blockchain' : 'Blockchain'}
                  </Badge>
                  <Badge variant="secondary">
                    {t.language === 'es' ? 'IA' : 'AI'}
                  </Badge>
                </div>
              </div>
              <div className="lg:w-1/3">
                <Button size="lg" variant="secondary" className="w-full">
                  {t.language === 'es' ? 'Ver Detalles' : 'View Details'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {projects.map((project, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <i className={`${project.icon} text-2xl text-orange-600`}></i>
                  <Badge variant={
                    project.status === 'En desarrollo' || project.status === 'In development' 
                      ? 'default' 
                      : 'secondary'
                  }>
                    {project.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <Badge variant="outline">{project.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  {project.description[t.language]}
                </p>
                <Button variant="outline" className="w-full">
                  {t.language === 'es' ? 'Más Información' : 'Learn More'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DAO Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-users mr-3 text-blue-600"></i>
                {t.language === 'es' ? '¿Qué es un DAO?' : 'What is a DAO?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Una Organización Autónoma Descentralizada (DAO) permite que la comunidad tome decisiones colectivas sobre proyectos locales usando tecnología blockchain.'
                  : 'A Decentralized Autonomous Organization (DAO) allows the community to make collective decisions about local projects using blockchain technology.'
                }
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Gobernanza transparente' : 'Transparent governance'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Decisiones comunitarias' : 'Community decisions'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Desarrollo local' : 'Local development'}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-handshake mr-3 text-green-600"></i>
                {t.language === 'es' ? 'Cómo Participar' : 'How to Participate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-orange-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {t.language === 'es' ? 'Únete a la Comunidad' : 'Join the Community'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' 
                        ? 'Regístrate en nuestro Discord y conoce otros miembros.'
                        : 'Sign up for our Discord and meet other members.'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-orange-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {t.language === 'es' ? 'Propón Ideas' : 'Propose Ideas'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' 
                        ? 'Comparte proyectos que mejoren la comunidad local.'
                        : 'Share projects that improve the local community.'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-orange-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {t.language === 'es' ? 'Vota y Construye' : 'Vote and Build'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' 
                        ? 'Participa en votaciones y ayuda a construir el futuro.'
                        : 'Participate in voting and help build the future.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t.language === 'es' ? '¡Construyamos Juntos el Futuro!' : 'Let\'s Build the Future Together!'}
            </h2>
            <p className="mb-6">
              {t.language === 'es' 
                ? 'Únete a Santa Rita DAO y sé parte del cambio positivo en tu comunidad.'
                : 'Join Santa Rita DAO and be part of positive change in your community.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                {t.language === 'es' ? 'Únete al Discord' : 'Join Discord'}
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600">
                {t.language === 'es' ? 'Leer Whitepaper' : 'Read Whitepaper'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
