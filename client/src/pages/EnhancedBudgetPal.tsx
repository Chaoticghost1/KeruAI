import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Search, Star, GitFork, Download, Code } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  tags: string[];
  downloadUrl: string;
  createdAt: string;
  author: string;
}

interface GitHubProfile {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export default function EnhancedBudgetPal() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch featured GitHub templates
  const { data: featuredTemplates = [], isLoading: templatesLoading } = useQuery<BudgetTemplate[]>({
    queryKey: ['/api/budget/templates/featured'],
    enabled: activeTab === 'templates'
  });

  // Search templates
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<BudgetTemplate[]>({
    queryKey: ['/api/budget/templates', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiRequest('GET', `/api/budget/templates?q=${encodeURIComponent(searchQuery)}&limit=20`);
      return response.json();
    },
    enabled: searchQuery.length > 2
  });

  // GitHub profile
  const { data: githubProfile } = useQuery<GitHubProfile>({
    queryKey: ['/api/budget/github/profile'],
    enabled: activeTab === 'profile'
  });

  const displayedTemplates = searchQuery.length > 2 ? searchResults : featuredTemplates;
  const filteredTemplates = selectedCategory === 'all' 
    ? displayedTemplates 
    : displayedTemplates.filter(t => t.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(displayedTemplates.map(t => t.category)))];

  const handleForkRepository = async (template: BudgetTemplate) => {
    try {
      const [, , , owner, repo] = template.downloadUrl.split('/');
      const response = await apiRequest('POST', `/api/budget/templates/${owner}/${repo}/fork`);
      const forkedRepo = await response.json();
      window.open(forkedRepo.html_url, '_blank');
    } catch (error) {
      console.error('Failed to fork repository:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.budgetpal.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.budgetpal.description}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              {t.language === 'es' ? 'Panel Principal' : 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              {t.language === 'es' ? 'Plantillas GitHub' : 'GitHub Templates'}
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              {t.language === 'es' ? 'Perfil GitHub' : 'GitHub Profile'}
            </TabsTrigger>
          </TabsList>

          {/* Original Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="card-hover" data-testid="card-expenses">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-chart-pie mr-3 text-emerald-600"></i>
                    {t.language === 'es' ? 'Gastos' : 'Expenses'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t.language === 'es' 
                      ? 'Rastrea y categoriza todos tus gastos diarios automáticamente.'
                      : 'Track and categorize all your daily expenses automatically.'
                    }
                  </p>
                  <Button className="w-full" data-testid="button-view-expenses">
                    {t.language === 'es' ? 'Ver Gastos' : 'View Expenses'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover" data-testid="card-savings">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-piggy-bank mr-3 text-green-600"></i>
                    {t.language === 'es' ? 'Ahorros' : 'Savings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t.language === 'es' 
                      ? 'Establece metas de ahorro y sigue tu progreso mes a mes.'
                      : 'Set savings goals and track your progress month by month.'
                    }
                  </p>
                  <Button className="w-full" variant="outline" data-testid="button-my-goals">
                    {t.language === 'es' ? 'Mis Metas' : 'My Goals'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover" data-testid="card-income">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-chart-line mr-3 text-blue-600"></i>
                    {t.language === 'es' ? 'Ingresos' : 'Income'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t.language === 'es' 
                      ? 'Registra tus ingresos variables y mantén control total.'
                      : 'Record your variable income and maintain total control.'
                    }
                  </p>
                  <Button className="w-full" variant="outline" data-testid="button-add-income">
                    {t.language === 'es' ? 'Agregar Ingreso' : 'Add Income'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {t.language === 'es' ? '¡Toma Control de tu Dinero!' : 'Take Control of Your Money!'}
                </h2>
                <p className="mb-6">
                  {t.language === 'es' 
                    ? 'Comienza a administrar tus finanzas de manera inteligente y alcanza tus metas económicas.'
                    : 'Start managing your finances intelligently and reach your economic goals.'
                  }
                </p>
                <Button size="lg" variant="secondary" data-testid="button-get-started">
                  {t.budgetpal.cta}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GitHub Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t.language === 'es' ? 'Plantillas de Presupuesto de GitHub' : 'GitHub Budget Templates'}
                </CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={t.language === 'es' ? 'Buscar plantillas...' : 'Search templates...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                      data-testid="input-search-templates"
                    />
                  </div>
                  <div className="flex gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        data-testid={`filter-${category}`}
                      >
                        {category === 'all' 
                          ? (t.language === 'es' ? 'Todos' : 'All')
                          : category
                        }
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {templatesLoading || searchLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">
                      {t.language === 'es' ? 'Cargando plantillas...' : 'Loading templates...'}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id} className="hover:shadow-lg transition-shadow" data-testid={`template-${template.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{template.category}</Badge>
                                <Badge variant="outline">{template.language}</Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>by {template.author}</span>
                            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1 mb-4">
                            {template.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(template.downloadUrl, '_blank')}
                              data-testid={`button-view-${template.id}`}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              {t.language === 'es' ? 'Ver' : 'View'}
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleForkRepository(template)}
                              data-testid={`button-fork-${template.id}`}
                            >
                              <GitFork className="h-4 w-4 mr-1" />
                              {t.language === 'es' ? 'Fork' : 'Fork'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GitHub Profile */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fab fa-github text-xl"></i>
                  {t.language === 'es' ? 'Tu Perfil de GitHub' : 'Your GitHub Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {githubProfile ? (
                  <div className="flex items-start gap-6">
                    <img 
                      src={githubProfile.avatar_url} 
                      alt={githubProfile.name}
                      className="w-24 h-24 rounded-full"
                      data-testid="img-github-avatar"
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2" data-testid="text-github-name">
                        {githubProfile.name || githubProfile.login}
                      </h2>
                      <p className="text-slate-600 mb-4" data-testid="text-github-username">
                        @{githubProfile.login}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-emerald-600" data-testid="text-repos-count">
                            {githubProfile.public_repos}
                          </div>
                          <p className="text-sm text-slate-600">
                            {t.language === 'es' ? 'Repositorios' : 'Repositories'}
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-600" data-testid="text-followers-count">
                            {githubProfile.followers}
                          </div>
                          <p className="text-sm text-slate-600">
                            {t.language === 'es' ? 'Seguidores' : 'Followers'}
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-600" data-testid="text-following-count">
                            {githubProfile.following}
                          </div>
                          <p className="text-sm text-slate-600">
                            {t.language === 'es' ? 'Siguiendo' : 'Following'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">
                      {t.language === 'es' ? 'Cargando perfil...' : 'Loading profile...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}