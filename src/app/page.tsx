'use client';

import { Calculator } from '@/components/Calculator';
import { Logo } from '@/components/Logo';
import { ConversionHistory } from '@/components/ConversionHistory';
import { RateChart } from '@/components/RateChart';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 -left-32 w-64 h-64 bg-flux-orange/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-32 w-80 h-80 bg-flux-gold/10 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto px-4 py-8">
          {/* Header */}
          <motion.header 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo />
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <RateChart />
              <ConversionHistory />
            </div>
          </motion.header>

          {/* Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Calculator />
          </motion.div>

          {/* Footer */}
          <motion.footer 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-xs text-white/40">
              {t.app.version} · {t.app.ratesUpdated}
            </p>
            <p className="text-xs text-white/30 mt-1">
              {t.app.sources}
            </p>
          </motion.footer>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <motion.header 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo />
            <div className="flex items-center gap-4">
              <LanguageSwitch />
            </div>
          </motion.header>

          {/* Main Content */}
          <div className="grid grid-cols-12 gap-8">
            {/* Calculator - Main Area */}
            <motion.div
              className="col-span-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Calculator showRatesPanel={false} />
            </motion.div>

            {/* Sidebar - Additional Info */}
            <motion.div
              className="col-span-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <DesktopSidebar />
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer 
            className="mt-12 text-center border-t border-white/10 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-xs text-white/40">
              {t.app.version} · {t.app.ratesUpdated}
            </p>
            <p className="text-xs text-white/30 mt-1">
              {t.app.sources}
            </p>
          </motion.footer>
        </div>
      </div>
    </main>
  );
}
