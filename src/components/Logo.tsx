'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function Logo() {
  const { t } = useLanguage();

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-flux-orange to-flux-gold flex items-center justify-center shadow-lg glow-orange">
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <motion.div 
          className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-flux-darker"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold gradient-text">{t.app.title}</h1>
        <p className="text-xs text-white/50">{t.app.subtitle}</p>
      </div>
    </motion.div>
  );
}
