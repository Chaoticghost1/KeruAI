import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { language, setLanguage, t } = useLanguage();

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
                {t.brand.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'es' ? 'EN' : 'ES'}</span>
              </Button>
              
              <Link href="/auth">
                <Button variant="ghost">{t.auth.signIn}</Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {t.auth.getStarted}
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
              {t.landing.aiTutoring}
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t.landing.heroTitle.split(' ').slice(0, 2).join(' ')}
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.landing.heroTitle.split(' ').slice(2).join(' ')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t.landing.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                  {t.landing.startLearning}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {t.landing.joinAsTeacher}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.landing.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Tutoring */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>{t.landing.aiTutoringTitle}</CardTitle>
                <CardDescription>
                  {t.landing.aiTutoringDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Content Management */}
            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>{t.landing.contentMgmtTitle}</CardTitle>
                <CardDescription>
                  {t.landing.contentMgmtDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Gamification */}
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>{t.landing.gamificationTitle}</CardTitle>
                <CardDescription>
                  {t.landing.gamificationDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Role-Based Access */}
            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>{t.landing.roleBasedTitle}</CardTitle>
                <CardDescription>
                  {t.landing.roleBasedDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Real-time Communication */}
            <Card className="border-2 hover:border-teal-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle>{t.landing.realtimeTitle}</CardTitle>
                <CardDescription>
                  {t.landing.realtimeDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Analytics */}
            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>{t.landing.analyticsTitle}</CardTitle>
                <CardDescription>
                  {t.landing.analyticsDesc}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t.landing.rolesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students */}
            <Card className="text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">{t.landing.studentsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.aiTutoringSessions}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.assignmentSubmissions}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.progressTracking}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.badgeRewards}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.studyStreaks}
                  </li>
                </ul>
                <Link href="/auth" className="mt-6 block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t.landing.joinAsStudent}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Teachers */}
            <Card className="text-center border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">{t.landing.teachersTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.contentCreation}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.assignmentMgmt}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.studentProgress}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.gradingSystem}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.contentPublishing}
                  </li>
                </ul>
                <Link href="/auth" className="mt-6 block">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {t.landing.joinAsTeacher}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Administrators */}
            <Card className="text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl">{t.landing.adminsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.platformMgmt}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.userAdmin}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.analyticsReports}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.contentModeration}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {t.landing.systemSettings}
                  </li>
                </ul>
                <Link href="/auth" className="mt-6 block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    {t.landing.adminAccess}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Authentication */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Secure & Verified Access
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Native secure authentication with token verification ensures only verified users can access educational content.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col items-center p-4">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">Email Verification</span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">Phone Verification</span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Google OAuth</span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Facebook Login</span>
              </div>
            </div>

            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Get Started Securely
                <Lock className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Keru.ai</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering education through AI technology and innovative learning platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                  Sign Up Today
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                  Teacher Registration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}