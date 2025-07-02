import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Chat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'kevin',
      text: t.language === 'es' 
        ? '¡Hola! Soy Kevin. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre trabajar en cruceros, destinos de viaje, y más.'
        : 'Hello! I\'m Kevin. How can I help you today? I can answer questions about working on cruise ships, travel destinations, and more.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate Kevin's response
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: 'kevin',
        text: t.language === 'es' 
          ? 'Gracias por tu pregunta. Permíteme pensar en la mejor respuesta para ti. Esta funcionalidad estará completamente disponible pronto.'
          : 'Thanks for your question. Let me think of the best answer for you. This functionality will be fully available soon.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const suggestedQuestions = [
    {
      es: '¿Cómo consigo trabajo en un crucero?',
      en: 'How do I get a job on a cruise ship?'
    },
    {
      es: '¿Cuáles son los mejores destinos del Caribe?',
      en: 'What are the best Caribbean destinations?'
    },
    {
      es: '¿Qué documentos necesito para trabajar en cruceros?',
      en: 'What documents do I need to work on cruise ships?'
    },
    {
      es: '¿Cómo es la vida a bordo de un crucero?',
      en: 'What is life like aboard a cruise ship?'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.chat.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.chat.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-96 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-user text-white"></i>
                  </div>
                  Kevin - {t.language === 'es' ? 'Asesor de Viajes' : 'Travel Advisor'}
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-900'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.language === 'es' ? 'Escribe tu pregunta...' : 'Type your question...'}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage}>
                    <i className="fas fa-paper-plane"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t.language === 'es' ? 'Preguntas Sugeridas' : 'Suggested Questions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question[t.language])}
                      className="w-full text-left p-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {question[t.language]}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t.language === 'es' ? 'Sobre Kevin' : 'About Kevin'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {t.language === 'es' 
                    ? 'Kevin tiene más de 5 años de experiencia trabajando en cruceros internacionales. Ha visitado más de 50 países y conoce los secretos de la industria.'
                    : 'Kevin has over 5 years of experience working on international cruise ships. He has visited more than 50 countries and knows the industry secrets.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
