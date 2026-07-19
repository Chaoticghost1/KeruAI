import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSystemFeatures } from '@/hooks/use-system-features';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { staggerCards } from '@/lib/animations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  GraduationCap, 
  Wallet, 
  Ship, 
  Globe, 
  Shield,
  BookOpen,
  Gamepad2,
  ArrowRight,
  Sparkles,
  Calculator,
  Languages,
  Handshake,
  Users
} from 'lucide-react';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { FeatureCard } from '@/components/FeatureCard';

export default function Dashboard() {
  const { user } = useAuth();
  const features = useSystemFeatures();
  const { t } = useLanguage();
  const userId = user?.id;

  const { data: studentTeachers = [] } = useQuery({
    queryKey: ['/api/students/teachers'],
    enabled: !!user && user?.role === 'student',
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/students/teachers');
      return res.json();
    },
  });
  const { data: studentClassesData = [] } = useQuery({
    queryKey: ['/api/classes/student'],
    enabled: !!user && user?.role === 'student',
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/classes/student');
      return res.json();
    },
  });
  const hasTeachers = Array.isArray(studentTeachers) && studentTeachers.length > 0;
  const hasApprovedClass = Array.isArray(studentClassesData) && studentClassesData.some(
    (item: { member?: { status?: string } }) => item?.member?.status === 'approved'
  );
  const studentNeedsClasses = user?.role === 'student' && (!hasTeachers || !hasApprovedClass);

  useEffect(() => {
    staggerCards('[data-animate="card"]');
  }, []);

  return (
    <PageLayout maxWidth="7xl">
      <PageHeader
        sticky={false}
        title={
          <h1 className="text-3xl font-bold text-foreground" data-testid="heading-welcome">
            {t.dashboard.welcomeBack}, {user?.firstName || user?.username}!
          </h1>
        }
        subtitle={
          <>
            <p className="text-lg text-muted-foreground" data-testid="text-suite-overview">
              {t.dashboard.suiteOverview}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-youth-primary" />
              <span>{t.dashboard.suiteTagline}</span>
            </div>
          </>
        }
        actions={
          <div className="flex items-center space-x-3" data-testid="user-info-section">
            <div className="w-12 h-12 rounded-youth-lg bg-youth-primary/20 flex items-center justify-center">
              {user?.role === 'superuser' ? (
                <Shield className="h-6 w-6 text-youth-primary" />
              ) : user?.role === 'teacher' ? (
                <BookOpen className="h-6 w-6 text-youth-primary" />
              ) : (
                <GraduationCap className="h-6 w-6 text-youth-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground capitalize" data-testid="text-user-role">
                {t.auth[user?.role as keyof typeof t.auth] ?? user?.role}
                {(user?.role === 'teacher' || user?.role === 'superuser') && (
                  <span className="ml-2 text-youth-primary font-semibold">
                    ({t.dashboard.contentManagement})
                  </span>
                )}
              </p>
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="pt-8">
        {/* Student: Get started — add teacher & join class first */}
        {studentNeedsClasses && (
          <div className="mb-8" data-testid="get-started-classes">
            <Card className="border-2 border-youth-primary/50 bg-youth-primary/5 rounded-youth-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-youth-primary" />
                  {t.dashboard.getStarted ?? 'Get started'}
                </CardTitle>
                <CardDescription>
                  {!hasTeachers && !hasApprovedClass
                    ? (t.dashboard.getStartedNoTeachersClass ?? 'Add a teacher and join a class to see study materials and chat. Go to Class Groups first.')
                    : !hasApprovedClass
                      ? (t.dashboard.getStartedNoApprovedClass ?? 'Join a class with your teacher\'s invite code and wait for approval to access materials.')
                      : (t.dashboard.getStartedNoTeachers ?? 'Add a teacher in Class Groups to see their revision materials.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="rounded-youth-lg bg-youth-primary hover:opacity-90 text-white">
                  <Link href="/classes">{t.nav.classes ?? 'Class Groups'}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student: Tu Progreso (Level + Badges cards + quick stats) */}
        {user?.role === 'student' && userId && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4" data-testid="heading-quick-stats-student">
              {t.dashboard.yourProgress}
            </h2>
            <ProgressDashboard userId={userId} />
          </div>
        )}

        {/* Student: Sigue Aprendiendo */}
        {user?.role === 'student' && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6" data-testid="heading-keep-learning">
              {t.dashboard.keepLearning}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                href="/studybuddy"
                icon={<GraduationCap className="h-7 w-7 text-youth-primary" />}
                title={t.dashboard.studyWithAI}
                description={t.dashboard.studyWithAIDesc}
                action={
                  <Button className="w-full rounded-youth-lg bg-youth-primary hover:opacity-90 text-white" data-testid="button-start-learning">
                    {t.dashboard.startLearning}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
                dataTestId="card-studybuddy"
              />
              <FeatureCard
                href="/revision"
                icon={<BookOpen className="h-7 w-7 text-youth-primary" />}
                title={t.dashboard.revisionMaterials}
                description={t.dashboard.revisionMaterialsDesc}
                action={
                  <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-revision">
                    {t.dashboard.startStudying}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
                dataTestId="card-revision"
              />
              <FeatureCard
                href="/mentorship"
                icon={<Handshake className="h-7 w-7 text-youth-primary" />}
                title={t.nav.mentorship}
                description={t.landingPage.mentorshipDesc}
                action={
                  <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-mentor-center">
                    {t.landingPage.findMentor}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
                dataTestId="card-mentor-center"
              />
            </div>
          </div>
        )}

        {/* Teacher / Superuser: Panel Rápido */}
        {(user?.role === 'teacher' || user?.role === 'superuser') && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6" data-testid="heading-quick-panel">
              {t.dashboard.quickPanel}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin#content">
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer rounded-youth-lg bg-card border-2 border-youth-muted/50 hover:border-youth-primary" data-testid="card-content">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-youth-lg bg-youth-primary/20 flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-youth-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">Content Management</CardTitle>
                    <CardDescription className="text-muted-foreground">Upload and manage study content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-content">
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin#classes">
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer rounded-youth-lg bg-card border-2 border-youth-muted/50 hover:border-youth-primary" data-testid="card-classes">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-youth-lg bg-youth-primary/20 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-youth-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">Clases y Grupos</CardTitle>
                    <CardDescription className="text-muted-foreground">Manage classes and students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full rounded-youth-lg">
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin#mentor-materials">
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer rounded-youth-lg bg-card border-2 border-youth-muted/50 hover:border-youth-primary" data-testid="card-mentor-materials">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-youth-lg bg-youth-primary/20 flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-youth-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">Mentor Materials</CardTitle>
                    <CardDescription className="text-muted-foreground">Approve materials and add Teacher Recognized badge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full rounded-youth-lg">
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Superuser: Administración */}
        {user?.role === 'superuser' && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6" data-testid="heading-administration">
              {t.dashboard.administration}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/admin">
                <Card data-animate="card" className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer rounded-youth-lg bg-card border-2 border-youth-muted/50 hover:border-destructive" data-testid="card-admin-panel">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-youth-lg bg-destructive/20 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">Admin Panel</CardTitle>
                    <CardDescription className="text-muted-foreground">Users, Analytics, Settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-admin-panel">
                      Open Panel
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Games Section - All 3 games */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6" data-testid="heading-games">
            {t.dashboard.gamesEngagement}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              href="/games/cruiseword"
              icon={<Ship className="h-6 w-6 text-blue-600" />}
              title={t.dashboard.cruiseWord}
              description={t.dashboard.cruiseWordDesc}
              iconBgClassName="bg-blue-500/20"
              borderClassName="border-2 border-youth-muted/50 hover:border-youth-accent rounded-youth-lg bg-card hover:shadow-lg"
              action={
                <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-cruiseword">
                  {t.dashboard.playNow}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
              dataTestId="card-cruiseword"
            >
              <Link href="/games/cruiseword/learn" data-testid="button-cruiseword-learnpath">
                <Button variant="link" className="w-full p-0 h-8 text-violet-600 hover:text-violet-700" size="sm">
                  {t.dashboard.cruiseWordLearnPath}
                </Button>
              </Link>
            </FeatureCard>
            <FeatureCard
              href="/games/mathmaster"
              icon={<Calculator className="h-6 w-6 text-emerald-600" />}
              title={t.dashboard.mathMaster}
              description={t.dashboard.mathMasterDesc}
              iconBgClassName="bg-emerald-500/20"
              borderClassName="border-2 border-youth-muted/50 hover:border-emerald-500 rounded-youth-lg bg-card hover:shadow-lg"
              action={
                <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-mathmaster">
                  {t.dashboard.playNow}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
              dataTestId="card-mathmaster"
            />
            <FeatureCard
              href="/games/linguaplay"
              icon={<Languages className="h-6 w-6 text-violet-600" />}
              title={t.dashboard.linguaPlay}
              description={t.dashboard.linguaPlayDesc}
              iconBgClassName="bg-violet-500/20"
              borderClassName="border-2 hover:border-violet-500 rounded-youth-lg bg-card hover:shadow-lg"
              action={
                <Button variant="outline" className="w-full rounded-youth-lg" data-testid="button-linguaplay">
                  {t.dashboard.playNow}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
              dataTestId="card-linguaplay"
            >
              <Link href="/games/linguaplay/learn" data-testid="button-linguaplay-learnpath">
                <Button variant="link" className="w-full p-0 h-8 text-violet-600 hover:text-violet-700" size="sm">
                  {t.dashboard.cruiseWordLearnPath}
                </Button>
              </Link>
            </FeatureCard>
          </div>
          <div className="mt-4 flex justify-center">
            <Link href="/games">
              <Button variant="ghost" size="sm" data-testid="button-all-games">
                {t.dashboard.allGames ?? "All games"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Herramientas / Tools - for all roles */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6" data-testid="heading-tools">
            {t.dashboard.tools}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              href="/budgetpal"
              icon={<Wallet className="h-7 w-7 text-youth-success" />}
              title={t.dashboard.trackBudget}
              description={t.dashboard.trackBudgetDesc}
              iconBgClassName="bg-youth-success/20"
              borderClassName="border-2 hover:border-youth-success rounded-youth-lg bg-card hover:shadow-xl"
              action={
                <Button className="w-full rounded-youth-lg bg-youth-success hover:opacity-90 text-white" data-testid="button-view-budget">
                  {t.dashboard.viewBudget}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
              dataTestId="card-budgetpal"
            />
            <FeatureCard
              href="/blog"
              icon={<Ship className="h-7 w-7 text-youth-accent" />}
              title={t.dashboard.exploreHonduras}
              description={t.dashboard.exploreHondurasDesc}
              iconBgClassName="bg-youth-accent/20"
              borderClassName="border-2 hover:border-youth-accent rounded-youth-lg bg-card hover:shadow-xl"
              action={
                <Button className="w-full rounded-youth-lg bg-youth-accent hover:opacity-90 text-white" data-testid="button-read-more">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
              dataTestId="card-travel-blog"
            />
            {features.dao_access && (
              <FeatureCard
                href="/dao"
                icon={<Users className="h-7 w-7 text-youth-primary" />}
                title="Santa Rita DAO"
                description="Local projects and sustainable transport"
                action={
                  <Button variant="outline" className="w-full rounded-youth-lg">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
            )}
            <FeatureCard
              href="/mentorship"
              icon={<Handshake className="h-7 w-7 text-youth-primary" />}
              title={t.nav.mentorship}
              description="Connect with certified mentors"
              action={
                <Button variant="outline" className="w-full rounded-youth-lg">
                  Find Mentor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
            />
            <FeatureCard
              href="/classes"
              icon={<Users className="h-7 w-7 text-youth-primary" />}
              title={t.nav.classes}
              description="Join or create class groups"
              action={
                <Button variant="outline" className="w-full rounded-youth-lg">
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
