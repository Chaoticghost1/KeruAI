import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Rss, Tag } from 'lucide-react';

export default function Blog() {
  const { t } = useLanguage();

  const emptyStateMessage = t.language === 'es' 
    ? 'Los artículos se cargarán desde la base de datos cuando estén disponibles.' 
    : 'Articles will load from the database when available.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.blog?.title || (t.language === 'es' ? 'Blog de Viajes' : 'Travel Blog')}
          </h1>
          <p className="text-xl text-slate-600">
            {t.blog?.description || (t.language === 'es' ? 'Historias y experiencias de viaje' : 'Travel stories and experiences')}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="py-16">
            <div className="text-center">
              <FileText className="h-20 w-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                {t.language === 'es' ? 'No hay artículos aún' : 'No articles yet'}
              </h3>
              <p className="text-slate-500">{emptyStateMessage}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rss className="w-5 h-5 mr-3 text-orange-600" />
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
                <Tag className="w-5 h-5 mr-3 text-green-600" />
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
