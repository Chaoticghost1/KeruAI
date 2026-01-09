import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { DataSaverToggle } from './DataSaverMode';
import { OnboardingFlow } from './OnboardingFlow';
import { socialLinks } from '../data/content';
import { useAuth } from '../hooks/use-auth';

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useLanguage();
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', icon: 'fas fa-home', key: 'home' },
    // Show Revision Materials for students
    ...(user?.role === 'student' ? [
      { href: '/revision', icon: 'fas fa-book-open', key: 'revision' }
    ] : []),
    { href: '/studybuddy', icon: 'fas fa-graduation-cap', key: 'study' },
    { href: '/budgetpal', icon: 'fas fa-wallet', key: 'budget' },
    // Travel Blog available for all users
    { href: '/blog', icon: 'fas fa-globe', key: 'travel' },
    // Games available for all users
    { href: '/cruiseword', icon: 'fas fa-ship', key: 'game' },
    // DAO Community
    { href: '/dao', icon: 'fas fa-users', key: 'dao' },
    // Mentorship Hub
    { href: '/mentorship', icon: 'fas fa-hands-helping', key: 'mentorship' }
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

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="text-slate-600 hover:text-slate-900"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-brain text-white text-sm"></i>
          </div>
          <span className="font-bold text-slate-900">{t.brand.name}</span>
        </div>
        <div className="w-8"></div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-80 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Logo/Brand */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{t.brand.name}</h1>
                  <p className="text-slate-400 text-sm">{t.brand.tagline}</p>
                </div>
              </Link>
              {/* Mobile Close Button */}
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Language Toggle */}
            <div className="mb-8">
              <LanguageToggle />
            </div>

            {/* User Menu - Show if logged in */}
            {user && (
              <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <i className={`fas ${
                      user.role === 'superuser' ? 'fa-shield-alt' : 
                      user.role === 'teacher' ? 'fa-chalkboard-teacher' : 
                      'fa-user'
                    } text-white text-sm`}></i>
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
                      <i className={`fas ${user.role === 'superuser' ? 'fa-cogs' : 'fa-chalkboard'} w-4`}></i>
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
                    <i className="fas fa-sign-out-alt w-4"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
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
                  <i className={`${item.icon} w-5`}></i>
                  <span>{t.nav[item.key as keyof typeof t.nav]}</span>
                </Link>
              ))}
            </nav>

            {/* Honduras-First Features */}
            {user && (
              <div className="mt-6 space-y-4 px-4">
                {/* Data Saver Toggle for Honduras low-bandwidth */}
                <DataSaverToggle />
                
                {/* Onboarding Flow for Digital Literacy */}
                <div className="mt-4">
                  <OnboardingFlow />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900">
          {/* Auth Links - Show if not logged in */}
          {!user && (
            <div className="mb-4 space-y-2">
              <Link
                href="/auth"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-2 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <i className="fas fa-user-plus"></i>
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
                <i className={`${link.icon} text-lg`}></i>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
