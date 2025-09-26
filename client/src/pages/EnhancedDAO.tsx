import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Users, MessageSquare, Bookmark, Calendar } from 'lucide-react';

export default function EnhancedDAO() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const projects = [
    {
      name: "Santa Rush",
      description: {
        es: "Sistema de transporte inteligente para Santa Rita de Copán con rutas optimizadas y pagos digitales.",
        en: "Smart transportation system for Santa Rita de Copán with optimized routes and digital payments."
      },
      status: t.language === 'es' ? 'En desarrollo' : 'In development',
      category: t.language === 'es' ? 'Transporte' : 'Transport',
      icon: 'fas fa-bus',
      progress: 65,
      contributors: 8,
      funding: '$12,500'
    },
    {
      name: "Mercado Local DAO",
      description: {
        es: "Plataforma descentralizada para conectar productores locales con consumidores de la región.",
        en: "Decentralized platform to connect local producers with regional consumers."
      },
      status: t.language === 'es' ? 'Planificación' : 'Planning',
      category: t.language === 'es' ? 'Comercio' : 'Commerce',
      icon: 'fas fa-store',
      progress: 25,
      contributors: 12,
      funding: '$8,200'
    },
    {
      name: "EcoCredits",
      description: {
        es: "Token de recompensa para acciones sostenibles y proyectos de reforestación comunitaria.",
        en: "Reward token for sustainable actions and community reforestation projects."
      },
      status: t.language === 'es' ? 'Prototipo' : 'Prototype',
      category: t.language === 'es' ? 'Sostenibilidad' : 'Sustainability',
      icon: 'fas fa-leaf',
      progress: 40,
      contributors: 6,
      funding: '$5,800'
    }
  ];

  const communityLinks = [
    {
      name: 'Discord',
      icon: 'fab fa-discord',
      url: 'https://discord.gg/santarita-dao',
      description: t.language === 'es' 
        ? 'Únete a nuestras discusiones diarias y propuestas comunitarias'
        : 'Join our daily discussions and community proposals',
      members: '1,247'
    },
    {
      name: 'Telegram',
      icon: 'fab fa-telegram',
      url: 'https://t.me/santaritadao',
      description: t.language === 'es'
        ? 'Canal oficial para anuncios y actualizaciones importantes'
        : 'Official channel for announcements and important updates',
      members: '892'
    },
    {
      name: 'GitHub',
      icon: 'fab fa-github',
      url: 'https://github.com/santarita-dao',
      description: t.language === 'es'
        ? 'Código abierto y colaboración en proyectos técnicos'
        : 'Open source code and technical project collaboration',
      members: '156'
    },
    {
      name: 'Forum',
      icon: 'fas fa-comments',
      url: 'https://forum.santarita-dao.org',
      description: t.language === 'es'
        ? 'Debates profundos sobre gobernanza y propuestas'
        : 'Deep discussions about governance and proposals',
      members: '634'
    }
  ];

  const proposals = [
    {
      id: 'SRP-001',
      title: t.language === 'es' ? 'Implementar WiFi Público en el Parque Central' : 'Implement Public WiFi in Central Park',
      author: 'CopaneroCoder',
      status: t.language === 'es' ? 'Votación Activa' : 'Active Voting',
      votes: { for: 156, against: 23, abstain: 12 },
      deadline: '2025-10-15',
      category: t.language === 'es' ? 'Infraestructura' : 'Infrastructure'
    },
    {
      id: 'SRP-002', 
      title: t.language === 'es' ? 'Programa de Microgranjas Urbanas' : 'Urban Microfarm Program',
      author: 'AgroInnovator',
      status: t.language === 'es' ? 'En Discusión' : 'Under Discussion',
      votes: { for: 89, against: 45, abstain: 8 },
      deadline: '2025-11-01',
      category: t.language === 'es' ? 'Agricultura' : 'Agriculture'
    },
    {
      id: 'SRP-003',
      title: t.language === 'es' ? 'Centro de Educación Digital Comunitario' : 'Community Digital Education Center',
      author: 'TechEducator',
      status: t.language === 'es' ? 'Aprobada' : 'Approved',
      votes: { for: 203, against: 15, abstain: 7 },
      deadline: '2025-09-20',
      category: t.language === 'es' ? 'Educación' : 'Education'
    }
  ];

  const events = [
    {
      title: t.language === 'es' ? 'Reunión Mensual de la Comunidad' : 'Monthly Community Meeting',
      date: '2025-10-05',
      time: '19:00 GMT-6',
      location: t.language === 'es' ? 'Discord + Centro Comunitario' : 'Discord + Community Center',
      type: t.language === 'es' ? 'Híbrido' : 'Hybrid'
    },
    {
      title: t.language === 'es' ? 'Workshop: Desarrollo en Blockchain' : 'Workshop: Blockchain Development',
      date: '2025-10-12',
      time: '14:00 GMT-6',
      location: t.language === 'es' ? 'Centro de Tecnología Local' : 'Local Tech Center',
      type: t.language === 'es' ? 'Presencial' : 'In-Person'
    },
    {
      title: t.language === 'es' ? 'Hackathon de Soluciones Locales' : 'Local Solutions Hackathon',
      date: '2025-10-26',
      time: '08:00 GMT-6',
      location: t.language === 'es' ? 'Universidad Local' : 'Local University',
      type: t.language === 'es' ? 'Presencial' : 'In-Person'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.santarita.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.santarita.description}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              {t.language === 'es' ? 'Resumen' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="community" data-testid="tab-community">
              {t.language === 'es' ? 'Comunidad' : 'Community'}
            </TabsTrigger>
            <TabsTrigger value="governance" data-testid="tab-governance">
              {t.language === 'es' ? 'Gobernanza' : 'Governance'}
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">
              {t.language === 'es' ? 'Eventos' : 'Events'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                    <Button size="lg" variant="secondary" className="w-full" data-testid="button-santa-rush-details">
                      {t.language === 'es' ? 'Ver Detalles' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {projects.map((project, index) => (
                <Card key={index} className="card-hover" data-testid={`project-${index}`}>
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
                    
                    {/* Project Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>{t.language === 'es' ? 'Progreso' : 'Progress'}</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.contributors}
                        </span>
                        <span className="font-medium text-green-600">
                          {project.funding}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" data-testid={`button-project-${index}`}>
                      {t.language === 'es' ? 'Más Información' : 'Learn More'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {communityLinks.map((link, index) => (
                <Card key={index} className="card-hover" data-testid={`community-${link.name.toLowerCase()}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <i className={`${link.icon} text-2xl text-orange-600`}></i>
                        <span>{link.name}</span>
                      </div>
                      <Badge variant="outline">{link.members} {t.language === 'es' ? 'miembros' : 'members'}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">
                      {link.description}
                    </p>
                    <Button 
                      onClick={() => window.open(link.url, '_blank')}
                      className="w-full"
                      data-testid={`button-join-${link.name.toLowerCase()}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t.language === 'es' ? 'Unirse' : 'Join'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.language === 'es' ? 'Estadísticas de la Comunidad' : 'Community Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-orange-600">2,929</div>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' ? 'Miembros Totales' : 'Total Members'}
                    </p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600">47</div>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' ? 'Propuestas Activas' : 'Active Proposals'}
                    </p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600">156</div>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' ? 'Contribuidores' : 'Contributors'}
                    </p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600">$47,200</div>
                    <p className="text-sm text-slate-600">
                      {t.language === 'es' ? 'Fondos Totales' : 'Total Funding'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid gap-6">
              {proposals.map((proposal, index) => (
                <Card key={proposal.id} className="card-hover" data-testid={`proposal-${proposal.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{proposal.id}</Badge>
                          <Badge variant={
                            proposal.status.includes('Votación') || proposal.status.includes('Voting') 
                              ? 'default' 
                              : proposal.status.includes('Aprobada') || proposal.status.includes('Approved')
                              ? 'destructive'
                              : 'secondary'
                          }>
                            {proposal.status}
                          </Badge>
                          <Badge variant="outline">{proposal.category}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                        <p className="text-sm text-slate-600">
                          {t.language === 'es' ? 'Por' : 'By'} {proposal.author} • 
                          {t.language === 'es' ? ' Vence: ' : ' Deadline: '}{new Date(proposal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Voting Results */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{t.language === 'es' ? 'A favor' : 'For'}</span>
                        <span className="font-medium text-green-600">{proposal.votes.for}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-green-600">{proposal.votes.for}</div>
                          <p className="text-slate-600">{t.language === 'es' ? 'A favor' : 'For'}</p>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{proposal.votes.against}</div>
                          <p className="text-slate-600">{t.language === 'es' ? 'En contra' : 'Against'}</p>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-slate-600">{proposal.votes.abstain}</div>
                          <p className="text-slate-600">{t.language === 'es' ? 'Abstención' : 'Abstain'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" data-testid={`button-details-${proposal.id}`}>
                        {t.language === 'es' ? 'Ver Detalles' : 'View Details'}
                      </Button>
                      {(proposal.status.includes('Votación') || proposal.status.includes('Voting')) && (
                        <Button size="sm" data-testid={`button-vote-${proposal.id}`}>
                          {t.language === 'es' ? 'Votar' : 'Vote'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-6">
              {events.map((event, index) => (
                <Card key={index} className="card-hover" data-testid={`event-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl mb-2">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span>{event.time}</span>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">
                      📍 {event.location}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" data-testid={`button-rsvp-${index}`}>
                        {t.language === 'es' ? 'Confirmar Asistencia' : 'RSVP'}
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-calendar-${index}`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        {t.language === 'es' ? 'Agregar al Calendario' : 'Add to Calendar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}