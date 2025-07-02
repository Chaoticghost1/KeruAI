import React from 'react';
import { Link } from 'wouter';

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  reverse?: boolean;
  gradient?: string;
  buttonColor?: string;
}

export function ToolCard({
  id,
  title,
  description,
  cta,
  href,
  imageSrc,
  imageAlt,
  reverse = false,
  gradient,
  buttonColor = 'bg-blue-600 hover:bg-blue-700'
}: ToolCardProps) {
  const handleClick = () => {
    // If it's an external link or route, navigate
    if (href.startsWith('http') || href.startsWith('/')) {
      if (href.startsWith('http')) {
        window.open(href, '_blank');
      }
    }
  };

  const content = (
    <section id={id} className="mb-16">
      <div className={`bg-white rounded-2xl shadow-xl p-8 lg:p-12 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 card-hover ${gradient || ''}`}>
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
          <div className={`lg:w-1/2 ${reverse ? 'lg:pl-12' : 'lg:pr-12'} mb-8 lg:mb-0`}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              {description}
            </p>
            {href.startsWith('/') ? (
              <Link href={href}>
                <button className={`${buttonColor} text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`}>
                  {cta}
                </button>
              </Link>
            ) : (
              <button 
                onClick={handleClick}
                className={`${buttonColor} text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`}
              >
                {cta}
              </button>
            )}
          </div>
          {imageSrc && (
            <div className="lg:w-1/2">
              <img 
                src={imageSrc}
                alt={imageAlt || title}
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return content;
}
