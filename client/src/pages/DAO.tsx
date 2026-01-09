import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Calendar, Sun, Moon, GitBranch, Activity } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
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
  return <span>{count}</span>;
}

export default function EnhancedDAO() {
  const { t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const emptyStateMessage = t.language === 'es' 
    ? 'Los datos se cargarán desde la base de datos cuando estén disponibles.' 
    : 'Data will load from the database when available.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <motion.div initial="hidden" animate={controls} variants={containerVariants} className="text-center mb-12">
          <motion.h1 variants={cardVariants} className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-yellow-500 mb-4">
            {t.santarita?.title || 'Santa Rita DAO'}
          </motion.h1>
          <motion.p variants={cardVariants} className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t.santarita?.description || (t.language === 'es' ? 'Comunidad descentralizada de Santa Rita de Copán' : 'Decentralized community of Santa Rita de Copán')}
          </motion.p>
          <motion.div variants={cardVariants} className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-4 w-4" />
              <AnimatedCounter end={0} /> {t.language === 'es' ? 'Miembros' : 'Members'}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <GitBranch className="h-4 w-4" />
              <AnimatedCounter end={0} /> {t.language === 'es' ? 'Proyectos' : 'Projects'}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-4 w-4" />
              <AnimatedCounter end={0} /> {t.language === 'es' ? 'Propuestas' : 'Proposals'}
            </Badge>
          </motion.div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 rounded-xl p-1">
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

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="h-5 w-5 mr-2 text-orange-500" />
                  {t.language === 'es' ? 'Proyectos Activos' : 'Active Projects'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <GitBranch className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">{t.language === 'es' ? 'No hay proyectos aún' : 'No projects yet'}</p>
                  <p className="text-sm text-slate-400 mt-2">{emptyStateMessage}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-500" />
                  {t.language === 'es' ? 'Enlaces de Comunidad' : 'Community Links'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">{t.language === 'es' ? 'No hay enlaces de comunidad aún' : 'No community links yet'}</p>
                  <p className="text-sm text-slate-400 mt-2">{emptyStateMessage}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-500" />
                  {t.language === 'es' ? 'Propuestas Activas' : 'Active Proposals'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">{t.language === 'es' ? 'No hay propuestas activas' : 'No active proposals'}</p>
                  <p className="text-sm text-slate-400 mt-2">{emptyStateMessage}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                  {t.language === 'es' ? 'Próximos Eventos' : 'Upcoming Events'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">{t.language === 'es' ? 'No hay eventos programados' : 'No scheduled events'}</p>
                  <p className="text-sm text-slate-400 mt-2">{emptyStateMessage}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
