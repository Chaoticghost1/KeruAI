import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { DataSaverToggle } from './DataSaverMode';
import { OnboardingFlow } from './OnboardingFlow';
import { useAuth } from '../hooks/use-auth';
import { 
  Home, BookOpen, GraduationCap, Wallet, Globe, Ship, Users, 
  Handshake, Menu, Brain, X, Shield, School, User, Settings, 
  LogOut, LogIn, UserPlus
} from 'lucide-react';
import { FaTwitter, FaYoutube, FaGithub } from 'react-icons/fa';

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  revision: <BookOpen className="w-5 h-5" />,
  study: <GraduationCap className="w-5 h-5" />,
  budget: <Wallet className="w-5 h-5" />,
  travel: <Globe className="w-5 h-5" />,
  game: <Ship className="w-5 h-5" />,
  dao: <Users className="w-5 h-5" />,
  mentorship: <Handshake className="w-5 h-5" />,
};

const socialIcons: Record<string, React.ReactNode> = {
  Twitter: <FaTwitter className="text-lg" />,
  YouTube: <FaYoutube className="text-lg" />,
  GitHub: <FaGithub className="text-lg" />,
};

const socialLinks = [
  { platform: "Twitter", url: "https://twitter.com/keruai" },
  { platform: "YouTube", url: "https://youtube.com/@keruai" },
  { platform: "GitHub", url: "https://github.com/keruai" }
];

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useLanguage();
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', key: 'home' },
    ...(user?.role === 'student' ? [
      { href: '/revision', key: 'revision' }
    ] : []),
    { href: '/studybuddy', key: 'study' },
    { href: '/budgetpal', key: 'budget' },
    { href: '/blog', key: 'travel' },
    { href: '/cruiseword', key: 'game' },
    { href: '/dao', key: 'dao' },
    { href: '/mentorship', key: 'mentorship' }
  ];

  const isActive = (href: string) => {
    if (href === '/' && location === '/') return true;
    if (href !== '/' && location.startsWith(href)) return true;
    return false;
  };

  const scrollToSection = (sectionId: string) => {
    if (location === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileOpen(false);
  };

  const getRoleIcon = () => {
    if (user?.role === 'superuser') return <Shield className="w-4 h-4 text-white" />;
    if (user?.role === 'teacher') return <School className="w-4 h-4 text-white" />;
    return <User className="w-4 h-4 text-white" />;
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="text-slate-600 hover:text-slate-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">{t.brand.name}</span>
        </div>
        <div className="w-8"></div>
      </header>

      <aside className={`fixed left-0 top-0 h-full w-80 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{t.brand.name}</h1>
                  <p className="text-slate-400 text-sm">{t.brand.tagline}</p>
                </div>
              </Link>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <LanguageToggle />
            </div>

            {user && (
              <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    {getRoleIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.firstName || user.username}
                    </p>
                    <p className="text-xs text-slate-300 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {(user.role === 'superuser' || user.role === 'teacher') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 rounded transition-colors"
                    >
                      {user.role === 'superuser' ? <Settings className="w-4 h-4" /> : <School className="w-4 h-4" />}
                      <span>{user.role === 'superuser' ? 'Admin Panel' : 'Teacher Panel'}</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-red-600 rounded transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (item.href === '/' && location === '/') {
                      scrollToSection('hero');
                    } else {
                      setIsMobileOpen(false);
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors ${
                    isActive(item.href) ? 'bg-slate-700' : ''
                  }`}
                  data-testid={`nav-${item.key}`}
                >
                  {iconMap[item.key]}
                  <span>{t.nav[item.key as keyof typeof t.nav]}</span>
                </Link>
              ))}
            </nav>

            {user && (
              <div className="mt-6 space-y-4 px-4">
                <DataSaverToggle />
                <div className="mt-4">
                  <OnboardingFlow />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900">
          {!user && (
            <div className="mb-4 space-y-2">
              <Link
                href="/auth"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-2 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-xs text-slate-400">
              {t.footer.built}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                {socialIcons[link.platform]}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
