import React, { useState, useEffect, useRef } from 'react';
import { Redirect } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { useSystemFeatures } from '@/hooks/use-system-features';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Users, MessageSquare, Bookmark, Calendar, MapPin, Clock, BarChart2, PieChart, GitBranch, Activity, CheckCircle2, Bus, MessageCircle } from 'lucide-react';
import { formatAsHondurasCurrency } from '@/lib/currency-formatter';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { useDaoProposals, type DaoProposal, type DaoVoteChoice } from '@/hooks/use-dao';
import { ProposalDetailSheet } from '@/components/dao/ProposalDetailSheet';
// --- Animated Counter Component ---
const AnimatedCounter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.ceil(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count}</>;
};

// --- Progress Ring Component ---
const ProgressRing = ({ progress, size = 60, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <svg height={size} width={size} className="transform -rotate-90">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#f97316"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="transition-all duration-700 ease-in-out"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-bold fill-orange-600"
      >
        {progress}%
      </text>
    </svg>
  );
};

// --- Main Component ---
export default function EnhancedDAO() {
  const { t } = useLanguage();
  const features = useSystemFeatures();
  const {
    proposals,
    isLoading,
    vote,
    isVoting,
    isOpen,
  } = useDaoProposals();
  const [selected, setSelected] = React.useState<DaoProposal | null>(null);
  const [userVote, setUserVote] = React.useState<DaoVoteChoice | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  if (!features.dao_access) {
    return <Redirect to="/dashboard" />;
  }

  const openDetail = (proposal: DaoProposal) => {
    setSelected(proposal);
    setUserVote(null);
    setDetailOpen(true);
  };

  const handleVote = async (choice: DaoVoteChoice) => {
    if (!selected) return;
    await vote({ id: selected.id, choice });
    setUserVote(choice);
    const updated = proposals.find((p) => p.id === selected.id);
    if (updated) setSelected(updated);
  };

  const projects = [
    {
      name: "Santa Rush",
      description: {
        es: "Sistema de transporte inteligente para Santa Rita de Copán con rutas optimizadas y pagos digitales.",
        en: "Smart transportation system for Santa Rita de Copán with optimized routes and digital payments."
      },
      status: t.language === 'es' ? 'En desarrollo' : 'In development',
      category: t.language === 'es' ? 'Transporte' : 'Transport',
      icon: <Bus className="w-10 h-10" />,
      progress: 65,
      contributors: 8,
      fundingUSD: 12500,
      tags: ['Blockchain', 'AI', 'Sustainable']
    },
    // ... (other projects)
  ];

  const communityLinks = [
    {
      name: 'Discord',
      icon: <MessageCircle className="w-6 h-6" />,
      url: 'https://discord.gg/santarita-dao',
      description: t.language === 'es'
        ? 'Únete a nuestras discusiones diarias y propuestas comunitarias'
        : 'Join our daily discussions and community proposals',
      members: '1,247',
      activity: 'high'
    },
    // ... (other links)
  ];

  const events = [
    {
      title: t.language === 'es' ? 'Reunión Mensual de la Comunidad' : 'Monthly Community Meeting',
      date: '2025-10-05',
      time: '19:00 GMT-6',
      location: t.language === 'es' ? 'Discord + Centro Comunitario' : 'Discord + Community Center',
      type: t.language === 'es' ? 'Híbrido' : 'Hybrid',
      map: 'https://maps.google.com/?q=Santa+Rita+de+Copán'
    },
    // ... (other events)
  ];

  // --- Animated Variants ---
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <PageLayout maxWidth="7xl">
        {/* --- Hero Section --- */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h1
            variants={cardVariants}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-yellow-500 mb-4"
          >
            {t.santarita.title}
          </motion.h1>
          <motion.p
            variants={cardVariants}
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            {t.santarita.description}
          </motion.p>
          <motion.div
            variants={cardVariants}
            className="flex justify-center gap-4 mt-6"
          >
            <Badge variant="secondary" className="gap-1">
              <Users className="h-4 w-4" />
              <AnimatedCounter end={2929} /> {t.language === 'es' ? 'Miembros' : 'Members'}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <GitBranch className="h-4 w-4" />
              <AnimatedCounter end={12} /> {t.language === 'es' ? 'Proyectos' : 'Projects'}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-4 w-4" />
              <AnimatedCounter end={47} /> {t.language === 'es' ? 'Propuestas' : 'Proposals'}
            </Badge>
          </motion.div>
        </motion.div>

        {/* --- Tabs --- */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all">
              {t.language === 'es' ? 'Resumen' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all">
              {t.language === 'es' ? 'Comunidad' : 'Community'}
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all">
              {t.language === 'es' ? 'Gobernanza' : 'Governance'}
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all">
              {t.language === 'es' ? 'Eventos' : 'Events'}
            </TabsTrigger>
          </TabsList>

          {/* --- Overview Tab --- */}
          <TabsContent value="overview" className="space-y-6">
            {/* --- Hero Project --- */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-none shadow-xl hover:shadow-2xl transition-shadow transform hover:-rotate-1">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center">
                    <div className="lg:w-2/3 lg:pr-8 mb-6 lg:mb-0">
                      <div className="flex items-center mb-4">
                        <Bus className="w-10 h-10 mr-4" />
                        <h2 className="text-3xl font-bold">Santa Rush</h2>
                      </div>
                      <p className="text-lg mb-6 opacity-90">
                        {t.language === 'es'
                          ? 'Revolucionando el transporte público en Santa Rita de Copán con tecnología blockchain y optimización de rutas inteligente.'
                          : 'Revolutionizing public transport in Santa Rita de Copán with blockchain technology and smart route optimization.'
                        }
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {projects[0].tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="bg-white/20 hover:bg-white/30 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="lg:w-1/3">
                      <Button size="lg" className="w-full bg-white text-orange-600 hover:bg-gray-100 transition-colors font-bold">
                        {t.language === 'es' ? 'Ver Detalles' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* --- Projects Grid --- */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              {projects.map((project, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="h-full hover:shadow-lg transition-shadow border border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl text-orange-600">
                          {project.icon}
                        </div>
                        <Badge variant={project.status === (t.language === 'es' ? 'En desarrollo' : 'In development') ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                        {project.category}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        {project.description[t.language]}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <ProgressRing progress={project.progress} />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Users className="h-4 w-4" />
                            {project.contributors}
                          </div>
                          <div className="font-medium text-green-600">
                            {formatAsHondurasCurrency(project.fundingUSD, t.language)}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full bg-orange-50 hover:bg-orange-100 transition-colors">
                        {t.language === 'es' ? 'Más Información' : 'Learn More'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* --- Community Tab --- */}
          <TabsContent value="community" className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid md:grid-cols-2 gap-6"
            >
              {communityLinks.map((link, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="hover:shadow-lg transition-shadow border border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl text-orange-600">
                            {link.icon}
                          </div>
                          <span className="text-foreground">{link.name}</span>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                          {link.members} {t.language === 'es' ? 'miembros' : 'members'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        {link.description}
                      </p>
                      <Button
                        onClick={() => window.open(link.url, '_blank')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t.language === 'es' ? 'Unirse' : 'Join'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* --- Community Stats --- */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <Card className="border border-slate-200 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {t.language === 'es' ? 'Estadísticas de la Comunidad' : 'Community Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        <AnimatedCounter end={2929} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {t.language === 'es' ? 'Miembros Totales' : 'Total Members'}
                      </p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        <AnimatedCounter end={47} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {t.language === 'es' ? 'Propuestas Activas' : 'Active Proposals'}
                      </p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        <AnimatedCounter end={156} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {t.language === 'es' ? 'Contribuidores' : 'Contributors'}
                      </p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {formatAsHondurasCurrency(projects.reduce((sum, p) => sum + p.fundingUSD, 0), t.language)}
                      </div>
                      <p className="text-sm text-slate-600">
                        {t.language === 'es' ? 'Fondos Totales' : 'Total Funding'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* --- Governance Tab (live, Aragon OSx-inspired) --- */}
          <TabsContent value="governance" className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid gap-6"
            >
              {isLoading ? (
                <p className="text-sm text-slate-600">{t.language === 'es' ? 'Cargando propuestas…' : 'Loading proposals…'}</p>
              ) : proposals.length === 0 ? (
                <p className="text-sm text-slate-600">{t.language === 'es' ? 'Aún no hay propuestas.' : 'No proposals yet.'}</p>
              ) : (
                proposals.map((proposal) => (
                  <motion.div key={proposal.id} variants={cardVariants}>
                    <Card className="hover:shadow-lg transition-shadow border border-slate-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                                #{proposal.id}
                              </Badge>
                              <Badge variant={
                                proposal.status === 'active'
                                  ? 'default'
                                  : proposal.status === 'passed' || proposal.status === 'executed'
                                  ? 'secondary'
                                  : 'destructive'
                              }>
                                {proposal.status === 'active'
                                  ? (t.language === 'es' ? 'Votación Activa' : 'Active Voting')
                                  : proposal.status === 'passed'
                                  ? (t.language === 'es' ? 'Aprobada' : 'Passed')
                                  : proposal.status === 'rejected'
                                  ? (t.language === 'es' ? 'Rechazada' : 'Rejected')
                                  : proposal.status === 'executed'
                                  ? (t.language === 'es' ? 'Ejecutada' : 'Executed')
                                  : (t.language === 'es' ? 'Borrador' : 'Draft')}
                              </Badge>
                              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                                {proposal.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                            <p className="text-sm text-slate-600">
                              {t.language === 'es' ? 'Vence: ' : 'Deadline: '}
                              <span className="font-medium">
                                {new Date(proposal.deadline).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{t.language === 'es' ? 'A favor' : 'For'}</span>
                            <span className="font-medium text-green-600">
                              {proposal.tally?.for ?? 0}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${((proposal.tally?.for ?? 0) / Math.max(1, proposal.tally?.total ?? 0)) * 100}%` }}
                              transition={{ duration: 1.5, ease: 'easeOut' }}
                              className="bg-green-500 h-2 rounded-full"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium text-green-600">
                                {proposal.tally?.for ?? 0}
                              </div>
                              <p className="text-slate-600">
                                {t.language === 'es' ? 'A favor' : 'For'}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-red-600">
                                {proposal.tally?.against ?? 0}
                              </div>
                              <p className="text-slate-600">
                                {t.language === 'es' ? 'En contra' : 'Against'}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-slate-600">
                                {proposal.tally?.abstain ?? 0}
                              </div>
                              <p className="text-slate-600">
                                {t.language === 'es' ? 'Abstención' : 'Abstain'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openDetail(proposal)}>
                            {t.language === 'es' ? 'Ver Detalles' : 'View Details'}
                          </Button>
                          {isOpen(proposal) && (
                            <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white transition-colors" onClick={() => openDetail(proposal)}>
                              {t.language === 'es' ? 'Votar' : 'Vote'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>

          {/* --- Events Tab --- */}
          <TabsContent value="events" className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid gap-6"
            >
              {events.map((event, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="hover:shadow-lg transition-shadow border border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl mb-2">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </span>
                            <Badge variant="outline" className="bg-orange-50 text-orange-600">
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {event.location}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                          {t.language === 'es' ? 'Confirmar Asistencia' : 'RSVP'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(event.map, '_blank')}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          {t.language === 'es' ? 'Ver Mapa' : 'View Map'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        <ProposalDetailSheet
          proposal={selected}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          language={t.language}
          userVote={userVote}
          canVote={!!selected && isOpen(selected)}
          onVote={handleVote}
          isVoting={isVoting}
        />
    </PageLayout>
  );
}
