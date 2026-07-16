import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Rss, Tag, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { PageLayout } from '@/components/PageLayout';

type BlogPost = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
};

const BLOG_PAGE_SIZE = 8;

export default function Blog() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<{ data: BlogPost[]; total: number }>({
    queryKey: ['/api/blog/posts', page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(BLOG_PAGE_SIZE),
        offset: String((page - 1) * BLOG_PAGE_SIZE),
      });
      const res = await apiRequest('GET', `/api/blog/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load posts');
      return res.json();
    },
    retry: false,
  });

  const posts = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const emptyStateMessage = t.language === 'es'
    ? 'Los artículos se cargarán cuando estén disponibles.'
    : 'Articles will appear when available.';

  return (
    <PageLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t.blog?.title || (t.language === 'es' ? 'Blog de Viajes' : 'Travel Blog')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t.blog?.description || (t.language === 'es' ? 'Historias y experiencias de viaje' : 'Travel stories and experiences')}
        </p>
      </div>

      {isLoading ? (
        <Card className="mb-8 rounded-youth-lg border-youth-muted/50">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">{t.language === 'es' ? 'Cargando artículos...' : 'Loading articles...'}</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="mb-8 rounded-youth-lg border-youth-muted/50">
          <CardContent className="py-16">
            <div className="text-center text-amber-600">
              <p>{t.language === 'es' ? 'No se pudieron cargar los artículos.' : 'Could not load articles.'}</p>
            </div>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="mb-8 rounded-youth-lg border-youth-muted/50">
          <CardContent className="py-16">
            <div className="text-center">
              <FileText className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {t.language === 'es' ? 'No hay artículos aún' : 'No articles yet'}
              </h3>
              <p className="text-muted-foreground">{emptyStateMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
          <>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {posts.map((post) => (
            <Card key={post.id} className="card-hover overflow-hidden rounded-youth-lg border-youth-muted/50">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                <CardTitle className="text-xl text-foreground">{post.title}</CardTitle>
                {post.publishedAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.publishedAt), 'PP')}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 200)}...
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="outline"
              className="rounded-youth-lg"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t.language === 'es' ? 'Anterior' : 'Previous'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t.language === 'es' ? 'Página' : 'Page'} {page} {t.language === 'es' ? 'de' : 'of'} {totalPages}
            </span>
            <Button
              variant="outline"
              className="rounded-youth-lg"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t.language === 'es' ? 'Siguiente' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover rounded-youth-lg border-youth-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Rss className="w-5 h-5 mr-3 text-youth-accent" />
              {t.language === 'es' ? 'Suscríbete al Blog' : 'Subscribe to Blog'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t.language === 'es' 
                ? 'Recibe las últimas historias y consejos de viaje directamente en tu correo.'
                : 'Get the latest stories and travel tips directly in your email.'
              }
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder={t.language === 'es' ? 'Tu correo electrónico' : 'Your email'}
                className="flex-1 px-3 py-2 border border-youth-muted rounded-youth-lg focus:outline-none focus:ring-2 focus:ring-youth-primary"
              />
              <Button className="rounded-youth-lg bg-youth-primary hover:opacity-90">
                {t.language === 'es' ? 'Suscribir' : 'Subscribe'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover rounded-youth-lg border-youth-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Tag className="w-5 h-5 mr-3 text-youth-success" />
              {t.language === 'es' ? 'Categorías Populares' : 'Popular Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                t.language === 'es' ? 'Trabajo en Cruceros' : 'Cruise Jobs',
                t.language === 'es' ? 'Destinos' : 'Destinations',
                t.language === 'es' ? 'Comida Internacional' : 'International Food',
                t.language === 'es' ? 'Playas' : 'Beaches',
                t.language === 'es' ? 'Cultura Local' : 'Local Culture',
                t.language === 'es' ? 'Consejos de Viaje' : 'Travel Tips'
              ].map((category) => (
                <Badge key={category} variant="outline" className="cursor-pointer hover:bg-youth-muted/50 rounded-youth-lg">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
