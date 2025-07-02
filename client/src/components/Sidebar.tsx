import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { socialLinks } from '../data/content';

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useLanguage();
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: 'fas fa-home', key: 'home' },
    { href: '/studybuddy', icon: 'fas fa-graduation-cap', key: 'study' },
    { href: '/budgetpal', icon: 'fas fa-wallet', key: 'budget' },
    { href: '/blog', icon: 'fas fa-globe', key: 'travel' },
    { href: '/cruiseword', icon: 'fas fa-ship', key: 'game' },
    { href: '/dao', icon: 'fas fa-bus', key: 'dao' },
    { href: '/aethosbyte', icon: 'fas fa-brain', key: 'cleanup' },
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
      <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between relative z-30">
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
      <aside className={`fixed left-0 top-0 h-full w-80 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
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
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{t.nav[item.key as keyof typeof t.nav]}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900">
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
