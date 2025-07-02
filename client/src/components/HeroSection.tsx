import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const scrolled = window.pageYOffset;
        imageRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStudyBuddy = () => {
    const element = document.getElementById('studybuddy');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" ref={heroRef} className="relative h-screen flex items-center justify-center text-white">
      {/* Hero background */}
      <div className="absolute inset-0 hero-gradient">
        <img 
          ref={imageRef}
          src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80" 
          alt="Futuristic digital cityscape representing AI technology" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {t.hero.title}
        </h1>
        <p className="text-xl lg:text-2xl mb-8 text-slate-200 max-w-2xl mx-auto">
          {t.hero.subtitle}
        </p>
        <button 
          onClick={scrollToStudyBuddy}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
        >
          {t.hero.cta}
        </button>
      </div>
    </section>
  );
}
