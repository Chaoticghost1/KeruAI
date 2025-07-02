import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { ToolCard } from '../components/ToolCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen lg:pt-0 -mt-16 lg:mt-0">
      <HeroSection />
      
      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Study Buddy AI */}
        <ToolCard
          id="studybuddy"
          title={t.studybuddy.title}
          description={t.studybuddy.description}
          cta={t.studybuddy.cta}
          href="/studybuddy"
          imageSrc="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
          imageAlt="Modern study setup with laptop and books"
          buttonColor="bg-blue-600 hover:bg-blue-700"
        />

        {/* BudgetPal */}
        <ToolCard
          id="budgetpal"
          title={t.budgetpal.title}
          description={t.budgetpal.description}
          cta={t.budgetpal.cta}
          href="/budgetpal"
          imageSrc="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
          imageAlt="Financial planning workspace with calculator and charts"
          reverse={true}
          buttonColor="bg-emerald-600 hover:bg-emerald-700"
        />

        {/* Travel & Cruise Section */}
        <section id="cruise-corner" className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 lg:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                {t.cruise.title}
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {t.cruise.description}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Travel Blog Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t.blog.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t.blog.description}
                </p>
                <a href="/blog">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {t.blog.cta}
                  </button>
                </a>
              </div>

              {/* Ask Kevin Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t.chat.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t.chat.description}
                </p>
                <a href="/chat">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {t.chat.cta}
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CruiseWord Game */}
        <ToolCard
          id="cruiseword"
          title={t.cruiseword.title}
          description={t.cruiseword.description}
          cta={t.cruiseword.cta}
          href="/cruiseword"
          imageSrc="https://images.unsplash.com/photo-1580541832626-2a7131ee809f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
          imageAlt="Modern cruise ship deck with ocean view"
          buttonColor="bg-cyan-600 hover:bg-cyan-700"
        />

        {/* Santa Rita DAO */}
        <ToolCard
          id="santarita"
          title={t.santarita.title}
          description={t.santarita.description}
          cta={t.santarita.cta}
          href="/dao"
          imageSrc="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
          imageAlt="Modern electric bus representing sustainable transport"
          reverse={true}
          buttonColor="bg-orange-600 hover:bg-orange-700"
        />

        {/* AethosByte */}
        <ToolCard
          id="aethosbyte"
          title={t.aethosbyte.title}
          description={t.aethosbyte.description}
          cta={t.aethosbyte.cta}
          href="/aethosbyte"
          imageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
          imageAlt="Clean workspace with computer showing file organization"
          buttonColor="bg-indigo-600 hover:bg-indigo-700"
        />
      </div>
    </div>
  );
}
