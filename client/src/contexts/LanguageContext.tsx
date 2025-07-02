import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/content';

type Language = 'es' | 'en';
type TranslationContent = typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationContent & { language: Language };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    // Update document language
    document.documentElement.lang = language;
    
    // Update page title based on language
    const title = language === 'es' 
      ? 'Keru.ai Suite - Tecnología, educación y oportunidades'
      : 'Keru.ai Suite - Technology, education, and opportunity';
    document.title = title;
  }, [language]);

  const translationData = translations[language];
  const t = { ...translationData, language } as TranslationContent & { language: Language };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
