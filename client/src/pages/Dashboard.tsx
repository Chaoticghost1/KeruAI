import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const tools = [
    // Teacher Panel - Content Management for teachers
    ...(user?.role === 'teacher' ? [{
      id: 'teacher-panel',
      title: 'Teacher Panel',
      description: 'Manage content, student assignments, and analytics',
      href: '/admin',
      icon: 'fas fa-chalkboard-teacher',
      color: 'from-purple-500 to-purple-600'
    }] : []),
    // Admin Panel - Full system management for superusers
    ...(user?.role === 'superuser' ? [{
      id: 'admin-panel',
      title: 'Admin Panel',
      description: 'Manage users, content, analytics, and system settings',
      href: '/admin',
      icon: 'fas fa-shield-alt',
      color: 'from-red-500 to-red-600'
    }] : []),
    // Student Revision Materials - SHOW FOR STUDENTS
    ...(user?.role === 'student' ? [{
      id: 'revision',
      title: 'Revision Materials',
      description: 'Study your assigned materials with AI assistance',
      href: '/revision',
      icon: 'fas fa-book-open',
      color: 'from-indigo-500 to-indigo-600'
    }] : []),
    {
      id: 'studybuddy',
      title: t.studybuddy.title,
      description: t.studybuddy.description,
      href: '/studybuddy',
      icon: 'fas fa-graduation-cap',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'budgetpal',
      title: t.budgetpal.title,
      description: t.budgetpal.description,
      href: '/budgetpal',
      icon: 'fas fa-wallet',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'blog',
      title: t.nav.travel,
      description: 'Explore travel destinations and cruise information',
      href: '/blog',
      icon: 'fas fa-globe',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'cruiseword',
      title: t.nav.game,
      description: 'Play word games and challenges',
      href: '/cruiseword',
      icon: 'fas fa-ship',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'dao',
      title: t.nav.dao,
      description: 'Participate in decentralized governance',
      href: '/dao',
      icon: 'fas fa-bus',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'aethosbyte',
      title: t.nav.cleanup,
      description: 'AI-powered file organization and cleanup',
      href: '/aethosbyte',
      icon: 'fas fa-brain',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || user?.username}!
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Choose a tool to get started with your tasks
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className={`fas ${
                  user?.role === 'superuser' ? 'fa-shield-alt' : 
                  user?.role === 'teacher' ? 'fa-chalkboard-teacher' : 
                  'fa-user'
                } text-white text-xl`}></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role}
                  {(user?.role === 'teacher' || user?.role === 'superuser') && (
                    <span className="ml-2 text-purple-600 font-semibold">
                      (Content Management Available)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                  <i className={`${tool.icon} text-white text-xl`}></i>
                </div>
                <CardTitle className="text-xl font-semibold">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button className="w-full">
                    Get Started
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Account Status
                </CardTitle>
                <i className="fas fa-check-circle text-green-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  {user.isVerified ? 'Verified account' : 'Verification pending'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Member Since
                </CardTitle>
                <i className="fas fa-calendar text-blue-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registration date
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Active
                </CardTitle>
                <i className="fas fa-clock text-purple-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Today'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last login
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}