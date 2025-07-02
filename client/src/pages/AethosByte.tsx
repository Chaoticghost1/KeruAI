import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AethosByte() {
  const { t } = useLanguage();

  const features = [
    {
      icon: 'fas fa-shield-alt',
      title: t.language === 'es' ? 'Privacidad Total' : 'Complete Privacy',
      description: t.language === 'es' 
        ? 'Todo el procesamiento se hace localmente en tu dispositivo. Tus archivos nunca salen de tu computadora.'
        : 'All processing is done locally on your device. Your files never leave your computer.'
    },
    {
      icon: 'fas fa-brain',
      title: t.language === 'es' ? 'IA Inteligente' : 'Smart AI',
      description: t.language === 'es' 
        ? 'Algoritmos avanzados identifican duplicados, archivos innecesarios y optimizan tu espacio de almacenamiento.'
        : 'Advanced algorithms identify duplicates, unnecessary files, and optimize your storage space.'
    },
    {
      icon: 'fas fa-bolt',
      title: t.language === 'es' ? 'Súper Rápido' : 'Lightning Fast',
      description: t.language === 'es' 
        ? 'Análisis completo de miles de archivos en segundos, sin ralentizar tu sistema.'
        : 'Complete analysis of thousands of files in seconds, without slowing down your system.'
    },
    {
      icon: 'fas fa-magic',
      title: t.language === 'es' ? 'Limpieza Automática' : 'Auto Cleanup',
      description: t.language === 'es' 
        ? 'Sugiere automáticamente qué archivos eliminar o mover para optimizar tu espacio.'
        : 'Automatically suggests which files to delete or move to optimize your space.'
    }
  ];

  const stats = [
    {
      number: '50GB+',
      label: t.language === 'es' ? 'Espacio promedio liberado' : 'Average space freed'
    },
    {
      number: '10,000+',
      label: t.language === 'es' ? 'Archivos analizados por minuto' : 'Files analyzed per minute'
    },
    {
      number: '100%',
      label: t.language === 'es' ? 'Procesamiento local' : 'Local processing'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.aethosbyte.title}
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            {t.aethosbyte.description}
          </p>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            {t.aethosbyte.cta}
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${feature.icon} text-2xl text-indigo-600`}></i>
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <p className="text-indigo-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t.language === 'es' ? '¿Cómo Funciona?' : 'How It Works?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-bold mb-2">
                  {t.language === 'es' ? 'Escanea' : 'Scan'}
                </h3>
                <p className="text-slate-600">
                  {t.language === 'es' 
                    ? 'AethosByte analiza todos tus archivos localmente'
                    : 'AethosByte analyzes all your files locally'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-bold mb-2">
                  {t.language === 'es' ? 'Analiza' : 'Analyze'}
                </h3>
                <p className="text-slate-600">
                  {t.language === 'es' 
                    ? 'La IA identifica duplicados y archivos innecesarios'
                    : 'AI identifies duplicates and unnecessary files'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-bold mb-2">
                  {t.language === 'es' ? 'Optimiza' : 'Optimize'}
                </h3>
                <p className="text-slate-600">
                  {t.language === 'es' 
                    ? 'Recibe sugerencias para liberar espacio de forma segura'
                    : 'Get suggestions to safely free up space'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Types */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-file mr-3 text-blue-600"></i>
                {t.language === 'es' ? 'Tipos de Archivo Soportados' : 'Supported File Types'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'Documentos', icon: 'fas fa-file-word', color: 'text-blue-600' },
                  { type: 'Imágenes', icon: 'fas fa-file-image', color: 'text-green-600' },
                  { type: 'Videos', icon: 'fas fa-file-video', color: 'text-red-600' },
                  { type: 'Audio', icon: 'fas fa-file-audio', color: 'text-purple-600' },
                  { type: 'Archivos', icon: 'fas fa-file-archive', color: 'text-orange-600' },
                  { type: 'Código', icon: 'fas fa-file-code', color: 'text-gray-600' }
                ].map((fileType, index) => (
                  <div key={index} className="flex items-center p-2 bg-slate-50 rounded">
                    <i className={`${fileType.icon} ${fileType.color} mr-2`}></i>
                    <span className="text-sm">{fileType.type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-download mr-3 text-green-600"></i>
                {t.language === 'es' ? 'Descargar Gratis' : 'Download Free'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Disponible para Windows, macOS y Linux. Sin suscripciones, sin costos ocultos.'
                  : 'Available for Windows, macOS, and Linux. No subscriptions, no hidden costs.'
                }
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <i className="fab fa-windows mr-2"></i>
                  Windows 10/11
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fab fa-apple mr-2"></i>
                  macOS 10.15+
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fab fa-linux mr-2"></i>
                  Linux (AppImage)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t.language === 'es' ? '¡Libera Espacio Hoy Mismo!' : 'Free Up Space Today!'}
            </h2>
            <p className="mb-6">
              {t.language === 'es' 
                ? 'Únete a miles de usuarios que ya han recuperado gigabytes de espacio con AethosByte.'
                : 'Join thousands of users who have already recovered gigabytes of space with AethosByte.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                {t.language === 'es' ? 'Descargar Gratis' : 'Download Free'}
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-indigo-600">
                {t.language === 'es' ? 'Ver Demo' : 'Watch Demo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
