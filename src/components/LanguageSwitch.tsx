'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      <button
        onClick={() => setLanguage('es')}
        className={cn(
          'px-2 py-1 text-xs font-medium rounded-md transition-all',
          language === 'es'
            ? 'bg-flux-orange text-black'
            : 'text-white/60 hover:text-white'
        )}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2 py-1 text-xs font-medium rounded-md transition-all',
          language === 'en'
            ? 'bg-flux-orange text-black'
            : 'text-white/60 hover:text-white'
        )}
      >
        EN
      </button>
    </div>
  );
}
