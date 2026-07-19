import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { DataSaverToggle } from './DataSaverMode';
import { OnboardingFlow } from './OnboardingFlow';
import { useAuth } from '../hooks/use-auth';
import { useSystemFeatures, NAV_TO_FEATURE } from '../hooks/use-system-features';
import { useQuery } from '@tanstack/react-query';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Home, BookOpen, GraduationCap, Wallet, Globe, Gamepad2, Users, 
  Handshake, Menu, Brain, X, Shield, School, User, Settings, 
  LogOut, LogIn, UserPlus, ChevronDown
} from 'lucide-react';
import { FaTwitter, FaYoutube, FaGithub } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Badge {
  id: number;
  badgeKey: string;
  name: string;
  icon: string;
  rarity: string;
}

interface UserBadge {
  id: number;
  badgeId: number;
  earnedAt: string;
}

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  profile: <User className="w-5 h-5" />,
  revision: <BookOpen className="w-5 h-5" />,
  study: <GraduationCap className="w-5 h-5" />,
  budget: <Wallet className="w-5 h-5" />,
  travel: <Globe className="w-5 h-5" />,
  game: <Gamepad2 className="w-5 h-5" />,
  dao: <Users className="w-5 h-5" />,
  mentorship: <Handshake className="w-5 h-5" />,
  classes: <Users className="w-5 h-5" />,
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

type NavItem = { href: string; key: string; roles?: string[] };
type NavGroup = { id: string; labelKey: string; items: NavItem[] };

function NavLink({
  href,
  navKey,
  isActive,
  onClick,
  children,
}: {
  href: string;
  navKey: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors ml-2 ${
        isActive ? 'bg-slate-700' : ''
      }`}
      data-testid={`nav-${navKey}`}
    >
      {children}
    </Link>
  );
}

const RARITY_ORDER: Record<string, number> = { common: 1, rare: 2, epic: 3, legendary: 4 };

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    learn: true, play: true, connect: true, life: true,
  });
  const { t } = useLanguage();
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const features = useSystemFeatures();

  const { data: userBadges } = useQuery<UserBadge[]>({
    queryKey: ['/api/progress', 'user-badges', user?.id],
    enabled: !!user?.id,
  });

  const { data: allBadges } = useQuery<Badge[]>({
    queryKey: ['/api/progress', 'badges'],
    enabled: !!user?.id && (userBadges?.length ?? 0) > 0,
  });

  const earnedBadges = (allBadges ?? [])
    .filter((b) => userBadges?.some((ub) => ub.badgeId === b.id))
    .sort((a, b) => (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0));
  const topBadge = earnedBadges[0];

  const filterByFeature = (items: NavItem[]): NavItem[] =>
    items.filter((item) => {
      const featureKey = NAV_TO_FEATURE[item.key];
      if (!featureKey) return true;
      return features[featureKey];
    });

  const navGroups: NavGroup[] = [
    {
      id: 'home',
      labelKey: 'home',
      items: [{ href: '/dashboard', key: 'home' }],
    },
    {
      id: 'learn',
      labelKey: 'learn',
      items: filterByFeature([
        { href: '/studybuddy', key: 'study' },
        ...(user?.role === 'student' ? [
          { href: '/revision', key: 'revision' as const },
          { href: '/profile', key: 'profile' as const },
        ] : []),
      ]),
    },
    {
      id: 'play',
      labelKey: 'play',
      items: filterByFeature([{ href: '/games', key: 'game' }]),
    },
    {
      id: 'connect',
      labelKey: 'connect',
      items: [
        { href: '/mentorship', key: 'mentorship' },
        { href: '/classes', key: 'classes' },
      ],
    },
    {
      id: 'life',
      labelKey: 'life',
      items: filterByFeature([
        { href: '/budget/mobile', key: 'budget' },
        { href: '/blog', key: 'travel' },
        { href: '/dao', key: 'dao' },
      ]),
    },
  ].filter((g) => g.items.length > 0);

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    if (href === '/dashboard') return location === '/dashboard';
    return href !== '/' && location.startsWith(href);
  };

  const scrollToSection = (sectionId: string) => {
    if (location === '/') {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
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
          <div className="w-8 h-8 bg-youth-primary rounded-youth-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">{t.brand.name}</span>
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
                <div className="w-10 h-10 bg-youth-primary rounded-youth-lg flex items-center justify-center">
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
              <div className="mb-6 overflow-hidden rounded-lg border border-slate-600/50 bg-slate-700/80">
                <div className="flex items-center gap-3 p-4">
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11 border-2 border-slate-600 rounded-full">
                      <AvatarImage
                        src={user.profileImage ? `${API_BASE}${user.profileImage}` : undefined}
                        alt=""
                      />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
                        {getRoleIcon()}
                      </AvatarFallback>
                    </Avatar>
                    {topBadge && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 ring-2 ring-slate-700 text-xs"
                        title={topBadge.name}
                      >
                        {topBadge.icon}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.firstName || user.username}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {topBadge ? topBadge.name : <span className="capitalize">{user.role}</span>}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-600/50 px-2 py-1.5">
                  {(user.role === 'superuser' || user.role === 'teacher') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600/60 hover:text-white"
                    >
                      {user.role === 'superuser' ? <Settings className="h-4 w-4 shrink-0" /> : <School className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{user.role === 'superuser' ? t.dashboard.adminPanel : t.dashboard.teacherPanel}</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600/60 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>{t.dashboard.logout}</span>
                  </button>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              {navGroups.map((group) => {
                const hasMultipleItems = group.items.length > 1;
                const defaultOpen = group.items.some((item) => isActive(item.href));

                if (hasMultipleItems) {
                  const isOpen = openGroups[group.id] ?? defaultOpen;
                  return (
                    <Collapsible
                      key={group.id}
                      open={isOpen}
                      onOpenChange={(open) => setOpenGroups((s) => ({ ...s, [group.id]: open }))}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300">
                          {t.nav[group.labelKey as keyof typeof t.nav]}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-0.5 py-1">
                          {group.items.map((item) => (
                            <NavLink
                              key={item.href}
                              href={item.href}
                              navKey={item.key}
                              isActive={isActive(item.href)}
                              onClick={() => {
                                if (item.href === '/' && location === '/') {
                                  scrollToSection('hero');
                                } else {
                                  setIsMobileOpen(false);
                                }
                              }}
                            >
                              {iconMap[item.key]}
                              <span>{t.nav[item.key as keyof typeof t.nav]}</span>
                            </NavLink>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                const item = group.items[0];
                return (
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
                );
              })}
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
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-youth-primary hover:opacity-90 text-white rounded-youth-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.auth.signIn}</span>
              </Link>
              <Link
                href="/auth"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-2 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.auth.createAccount}</span>
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
