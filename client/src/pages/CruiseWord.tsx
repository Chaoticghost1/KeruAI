import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CruiseWord() {
  const { t } = useLanguage();
  const [currentWord, setCurrentWord] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  const cruiseWords = [
    {
      word: "Galley",
      definition: {
        es: "La cocina principal del barco donde se preparan las comidas para la tripulación y pasajeros.",
        en: "The main kitchen of the ship where meals are prepared for crew and passengers."
      },
      category: t.language === 'es' ? 'Cocina' : 'Kitchen'
    },
    {
      word: "Muster",
      definition: {
        es: "Reunión obligatoria de la tripulación para simulacros de seguridad o emergencias.",
        en: "Mandatory crew meeting for safety drills or emergencies."
      },
      category: t.language === 'es' ? 'Seguridad' : 'Safety'
    },
    {
      word: "Port",
      definition: {
        es: "El lado izquierdo del barco cuando miras hacia adelante.",
        en: "The left side of the ship when facing forward."
      },
      category: t.language === 'es' ? 'Navegación' : 'Navigation'
    },
    {
      word: "Starboard",
      definition: {
        es: "El lado derecho del barco cuando miras hacia adelante.",
        en: "The right side of the ship when facing forward."
      },
      category: t.language === 'es' ? 'Navegación' : 'Navigation'
    },
    {
      word: "Cabin Steward",
      definition: {
        es: "Personal encargado de limpiar y mantener los camarotes de los pasajeros.",
        en: "Staff responsible for cleaning and maintaining passenger cabins."
      },
      category: t.language === 'es' ? 'Servicio' : 'Service'
    },
    {
      word: "Bridge",
      definition: {
        es: "El centro de control del barco donde el capitán y oficiales navegan.",
        en: "The ship's control center where the captain and officers navigate."
      },
      category: t.language === 'es' ? 'Navegación' : 'Navigation'
    },
    {
      word: "Tender",
      definition: {
        es: "Bote pequeño usado para transportar pasajeros del barco a la costa.",
        en: "Small boat used to transport passengers from ship to shore."
      },
      category: t.language === 'es' ? 'Transporte' : 'Transport'
    },
    {
      word: "FOH",
      definition: {
        es: "Front of House - Personal que trabaja directamente con los pasajeros.",
        en: "Front of House - Staff who work directly with passengers."
      },
      category: t.language === 'es' ? 'Servicio' : 'Service'
    },
    {
      word: "BOH",
      definition: {
        es: "Back of House - Personal que trabaja detrás de escena, como cocina y limpieza.",
        en: "Back of House - Staff who work behind the scenes, like kitchen and cleaning."
      },
      category: t.language === 'es' ? 'Operaciones' : 'Operations'
    },
    {
      word: "Sea Day",
      definition: {
        es: "Día completo navegando sin parar en ningún puerto.",
        en: "Full day at sea without stopping at any port."
      },
      category: t.language === 'es' ? 'Itinerario' : 'Itinerary'
    }
  ];

  const nextWord = () => {
    setCurrentWord((prev) => (prev + 1) % cruiseWords.length);
    setShowDefinition(false);
  };

  const prevWord = () => {
    setCurrentWord((prev) => (prev - 1 + cruiseWords.length) % cruiseWords.length);
    setShowDefinition(false);
  };

  const currentWordData = cruiseWords[currentWord];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.cruiseword.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.cruiseword.description}
          </p>
        </div>

        {/* Game Card */}
        <Card className="mb-8 card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {t.language === 'es' ? 'Palabra del Día' : 'Word of the Day'}
              </CardTitle>
              <Badge variant="secondary">
                {currentWord + 1} / {cruiseWords.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <Badge className="mb-4">{currentWordData.category}</Badge>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                {currentWordData.word}
              </h2>
              
              {showDefinition ? (
                <div className="bg-slate-100 p-4 rounded-lg mb-6">
                  <p className="text-lg text-slate-700">
                    {currentWordData.definition[t.language]}
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <Button 
                    onClick={() => setShowDefinition(true)}
                    className="mb-4"
                  >
                    {t.language === 'es' ? 'Ver Definición' : 'Show Definition'}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={prevWord}>
                <i className="fas fa-chevron-left mr-2"></i>
                {t.language === 'es' ? 'Anterior' : 'Previous'}
              </Button>
              <Button onClick={nextWord}>
                {t.language === 'es' ? 'Siguiente' : 'Next'}
                <i className="fas fa-chevron-right ml-2"></i>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress and Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">10</div>
              <p className="text-slate-600">
                {t.language === 'es' ? 'Palabras por día' : 'Words per day'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentWord + 1}
              </div>
              <p className="text-slate-600">
                {t.language === 'es' ? 'Palabras aprendidas' : 'Words learned'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(((currentWord + 1) / cruiseWords.length) * 100)}%
              </div>
              <p className="text-slate-600">
                {t.language === 'es' ? 'Progreso' : 'Progress'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t.language === 'es' ? 'Categorías de Vocabulario' : 'Vocabulary Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: t.language === 'es' ? 'Navegación' : 'Navigation', icon: 'fas fa-compass', count: 3 },
                { name: t.language === 'es' ? 'Servicio' : 'Service', icon: 'fas fa-concierge-bell', count: 2 },
                { name: t.language === 'es' ? 'Seguridad' : 'Safety', icon: 'fas fa-shield-alt', count: 1 },
                { name: t.language === 'es' ? 'Cocina' : 'Kitchen', icon: 'fas fa-utensils', count: 1 },
                { name: t.language === 'es' ? 'Operaciones' : 'Operations', icon: 'fas fa-cogs', count: 1 },
                { name: t.language === 'es' ? 'Itinerario' : 'Itinerary', icon: 'fas fa-calendar', count: 1 }
              ].map((category) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <i className={`${category.icon} text-blue-600 mr-3`}></i>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
