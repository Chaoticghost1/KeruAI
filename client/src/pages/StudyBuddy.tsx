import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudyBuddy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.studybuddy.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.studybuddy.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-question-circle mr-3 text-blue-600"></i>
                {t.language === 'es' ? 'Ayuda con Tareas' : 'Homework Help'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Obtén ayuda instantánea con tus tareas escolares y proyectos académicos.'
                  : 'Get instant help with your school assignments and academic projects.'
                }
              </p>
              <Button className="w-full">
                {t.language === 'es' ? 'Comenzar' : 'Start'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-file-alt mr-3 text-green-600"></i>
                {t.language === 'es' ? 'Resúmenes Inteligentes' : 'Smart Summaries'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Crea resúmenes automáticos de textos largos y documentos complejos.'
                  : 'Create automatic summaries of long texts and complex documents.'
                }
              </p>
              <Button className="w-full" variant="outline">
                {t.language === 'es' ? 'Resumir Texto' : 'Summarize Text'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-brain mr-3 text-purple-600"></i>
                {t.language === 'es' ? 'Preparación de Exámenes' : 'Exam Preparation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Genera preguntas de práctica y guías de estudio personalizadas.'
                  : 'Generate practice questions and personalized study guides.'
                }
              </p>
              <Button className="w-full" variant="outline">
                {t.language === 'es' ? 'Crear Examen' : 'Create Exam'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-language mr-3 text-orange-600"></i>
                {t.language === 'es' ? 'Ayuda con Idiomas' : 'Language Help'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Mejora tu gramática, vocabulario y comprensión de idiomas.'
                  : 'Improve your grammar, vocabulary, and language comprehension.'
                }
              </p>
              <Button className="w-full" variant="outline">
                {t.language === 'es' ? 'Practicar' : 'Practice'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t.language === 'es' ? '¡Empieza a Aprender Hoy!' : 'Start Learning Today!'}
            </h2>
            <p className="mb-6">
              {t.language === 'es' 
                ? 'Únete a miles de estudiantes que ya están mejorando sus calificaciones con nuestra IA.'
                : 'Join thousands of students already improving their grades with our AI.'
              }
            </p>
            <Button size="lg" variant="secondary">
              {t.language === 'es' ? 'Comenzar Gratis' : 'Start Free'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
