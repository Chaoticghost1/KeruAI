import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  GraduationCap, 
  Wallet, 
  Ship, 
  Globe, 
  CheckCircle2, 
  Calendar, 
  Clock,
  Shield,
  BookOpen,
  Gamepad2,
  Bus,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Welcome Hero Section */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div data-testid="welcome-section">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-welcome">
                Welcome back, {user?.firstName || user?.username}!
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400" data-testid="text-suite-overview">
                Your all-in-one platform for learning, budgeting, and travel exploration
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Keru.ai Suite - Empowering your daily life with AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-3" data-testid="user-info-section">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {user?.role === 'superuser' ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : user?.role === 'teacher' ? (
                  <BookOpen className="h-6 w-6 text-white" />
                ) : (
                  <GraduationCap className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize" data-testid="text-user-role">
                  {user?.role}
                  {(user?.role === 'teacher' || user?.role === 'superuser') && (
                    <span className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
                      (Content Management)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" data-testid="heading-main-features">
            Main Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* StudyBuddy Card */}
            <Link href="/studybuddy">
              <Card 
                className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-900"
                data-testid="card-studybuddy"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Study with AI
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Get help from your AI study buddy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>AI-powered learning assistance</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white" data-testid="button-start-learning">
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* BudgetPal Card */}
            <Link href="/budgetpal">
              <Card 
                className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-gray-900"
                data-testid="card-budgetpal"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-lg flex items-center justify-center mb-4">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Track Your Budget
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your finances and expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Smart expense tracking</span>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white" data-testid="button-view-budget">
                    View Budget
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Travel Blog Card */}
            <Link href="/blog">
              <Card 
                className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-cyan-500 dark:hover:border-cyan-400 bg-white dark:bg-gray-900"
                data-testid="card-travel-blog"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700 rounded-lg flex items-center justify-center mb-4">
                    <Ship className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Explore Honduras
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Discover travel tips and cruise deals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Latest destinations & cruise info</span>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white" data-testid="button-read-more">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Role-Based & Secondary Features */}
        {(user?.role === 'teacher' || user?.role === 'superuser' || user?.role === 'student') && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6" data-testid="heading-role-features">
              {user?.role === 'student' ? 'Your Learning Tools' : 'Management Tools'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.role === 'teacher' && (
                <Link href="/admin">
                  <Card 
                    className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    data-testid="card-teacher-panel"
                  >
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Teacher Panel
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Manage content and student assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" data-testid="button-teacher-panel">
                        Open Panel
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {user?.role === 'superuser' && (
                <Link href="/admin">
                  <Card 
                    className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    data-testid="card-admin-panel"
                  >
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Admin Panel
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Manage users and system settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" data-testid="button-admin-panel">
                        Open Panel
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {user?.role === 'student' && (
                <Link href="/revision">
                  <Card 
                    className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    data-testid="card-revision"
                  >
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Revision Materials
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Study your assigned materials with AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" data-testid="button-revision">
                        Start Studying
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Games & Community Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6" data-testid="heading-games-community">
            Games & Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/cruiseword">
              <Card 
                className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                data-testid="card-cruiseword"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg flex items-center justify-center mb-4">
                    <Gamepad2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    CruiseWord Game
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Play word games and challenges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" data-testid="button-play-game">
                    Play Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dao">
              <Card 
                className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                data-testid="card-dao"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg flex items-center justify-center mb-4">
                    <Bus className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Community DAO
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Participate in decentralized governance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" data-testid="button-join-dao">
                    Join Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6" data-testid="heading-quick-stats">
              Quick Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-900" data-testid="card-account-status">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                    Account Status
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-status-value">
                    Active
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {user.isVerified ? 'Verified account' : 'Verification pending'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900" data-testid="card-member-since">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                    Member Since
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-member-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Registration date
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900" data-testid="card-last-active">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                    Last Active
                  </CardTitle>
                  <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-last-active">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Today'}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Last login
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}