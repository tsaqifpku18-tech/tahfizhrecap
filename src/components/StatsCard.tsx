import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgColorClass: string;
  theme?: 'white' | 'dark' | 'emerald' | 'amber' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  colorClass,
  bgColorClass,
  theme = 'white',
}) => {
  // Determine card styles based on theme
  let cardClass = '';
  let titleClass = '';
  let valueClass = '';
  let descClass = '';

  if (theme === 'dark') {
    cardClass = 'bg-slate-900 text-white border-slate-800 shadow-lg';
    titleClass = 'text-slate-400';
    valueClass = 'text-blue-400';
    descClass = 'text-slate-400 italic';
  } else if (theme === 'blue') {
    cardClass = 'bg-blue-50/80 text-blue-900 border-blue-100 shadow-xs';
    titleClass = 'text-blue-800/80';
    valueClass = 'text-[#0000FE]';
    descClass = 'text-blue-700/80';
  } else if (theme === 'emerald') {
    cardClass = 'bg-blue-50 text-blue-900 border-blue-100 shadow-xs';
    titleClass = 'text-blue-800/80';
    valueClass = 'text-[#0000FE]';
    descClass = 'text-blue-700/80';
  } else if (theme === 'amber') {
    cardClass = 'bg-amber-50 text-amber-900 border-amber-100 shadow-xs';
    titleClass = 'text-amber-800/80';
    valueClass = 'text-amber-600';
    descClass = 'text-amber-700/80';
  } else {
    cardClass = 'bg-white text-slate-900 border-slate-200 shadow-sm';
    titleClass = 'text-slate-400';
    valueClass = 'text-slate-900';
    descClass = 'text-slate-400';
  }

  const cardId = `stats-card-${String(title || 'untitled').toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div 
      id={cardId} 
      className={`rounded-3xl p-6 border flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${cardClass}`}
    >
      <div className="space-y-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${titleClass}`}>{title}</span>
        <h3 className={`text-4xl font-extrabold tracking-tight ${valueClass}`}>{value}</h3>
        <p className={`text-xs mt-1 font-medium ${descClass}`}>{description}</p>
      </div>
      <div className={`p-4 rounded-2xl ${bgColorClass} ${colorClass} transition-transform duration-300 hover:scale-110 shrink-0`}>
        {icon}
      </div>
    </div>
  );
};

