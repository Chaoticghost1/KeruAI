import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Blog() {
  const { t } = useLanguage();

  const blogPosts = [
    {
      id: 1,
      title: t.language === 'es' ? 'Trabajar en Cruceros: Mi Primera Experiencia' : 'Working on Cruise Ships: My First Experience',
      excerpt: t.language === 'es' 
        ? 'Todo lo que necesitas saber antes de embarcar en tu primera aventura laboral en alta mar.'
        : 'Everything you need to know before embarking on your first work adventure at sea.',
      category: t.language === 'es' ? 'Trabajo' : 'Work',
      date: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
    },
    {
      id: 2,
      title: t.language === 'es' ? 'Los Mejores Destinos del Caribe' : 'The Best Caribbean Destinations',
      excerpt: t.language === 'es' 
        ? 'Descubre las islas más hermosas y sus secretos mejor guardados desde la perspectiva de alguien que las ha visitado.'
        : 'Discover the most beautiful islands and their best-kept secrets from someone who has visited them.',
      category: t.language === 'es' ? 'Destinos' : 'Destinations',
      date: '2024-01-10',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
    },
    {
      id: 3,
      title: t.language === 'es' ? 'Comida Internacional: Sabores del Mundo' : 'International Cuisine: Flavors of the World',
      excerpt: t.language === 'es' 
        ? 'Una guía gastronómica de los sabores más increíbles que he probado en mis viajes.'
        : 'A gastronomic guide to the most incredible flavors I have tasted in my travels.',
      category: t.language === 'es' ? 'Comida' : 'Food',
      date: '2024-01-05',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.blog.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.blog.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="card-hover overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-slate-500">{post.date}</span>
                </div>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{post.excerpt}</p>
                <button className="text-blue-600 hover:text-blue-800 font-semibold">
                  {t.language === 'es' ? 'Leer más →' : 'Read more →'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-rss mr-3 text-orange-600"></i>
                {t.language === 'es' ? 'Suscríbete al Blog' : 'Subscribe to Blog'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Recibe las últimas historias y consejos de viaje directamente en tu correo.'
                  : 'Get the latest stories and travel tips directly in your email.'
                }
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder={t.language === 'es' ? 'Tu correo electrónico' : 'Your email'}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  {t.language === 'es' ? 'Suscribir' : 'Subscribe'}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-tags mr-3 text-green-600"></i>
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
                  <Badge key={category} variant="outline" className="cursor-pointer hover:bg-slate-100">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
