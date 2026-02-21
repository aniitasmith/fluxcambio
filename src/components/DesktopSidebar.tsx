'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { RatesPanel } from './RateDisplay';
import { ConversionHistory } from './ConversionHistory';
import { RateChart } from './RateChart';
import { useRates } from '@/hooks/useRates';
import { useLanguage } from '@/contexts/LanguageContext';
import { getConversionHistory } from '@/lib/storage';
import { type ConversionHistoryItem } from '@/lib/constants';
import { TrendingUp, History, ArrowRight, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const modeColors: Record<string, string> = {
  ref: 'bg-flux-orange/20 text-flux-orange',
  ves: 'bg-flux-gold/20 text-flux-gold',
  vs: 'bg-purple-500/20 text-purple-400',
  cad: 'bg-blue-500/20 text-blue-400',
};

export function DesktopSidebar() {
  const { bcv, binance, cad, isLoading, refreshAll } = useRates();
  const { t, language } = useLanguage();
  const [recentHistory, setRecentHistory] = useState<ConversionHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const locale = language === 'es' ? es : enUS;
  const numberLocale = language === 'es' ? 'es-VE' : 'en-US';
  
  useEffect(() => {
    const history = getConversionHistory();
    setRecentHistory(history.slice(0, 5));
  }, []);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setIsRefreshing(false);
  };
  
  return (
    <div className="space-y-4 sticky top-8">
      {/* Live Rates */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-flux-orange" />
          {t.desktop.liveRates}
        </h3>
        <RatesPanel
          bcvUsd={bcv?.usd}
          bcvEur={bcv?.eur}
          binance={binance?.totalBid}
          cadUsd={cad?.usd}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          compact
        />
      </GlassCard>
      
      {/* Rate Chart Preview */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-flux-orange" />
          {t.desktop.rateChart}
        </h3>
        <div className="h-48">
          <RateChart asDialog={false} height={180} />
        </div>
      </GlassCard>
      
      {/* Recent History */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <History className="w-4 h-4 text-flux-orange" />
            {t.desktop.recentHistory}
          </h3>
          <ConversionHistory />
        </div>
        
        <div className="space-y-2">
          {recentHistory.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-4">{t.desktop.noRecent}</p>
          ) : (
            recentHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-[8px] px-1.5 py-0.5 rounded-full uppercase font-medium',
                    modeColors[item.mode]
                  )}>
                    {item.mode}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {format(new Date(item.timestamp), "dd/MM HH:mm", { locale })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-medium">
                    {item.input.toLocaleString(numberLocale, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-white/40">{item.inputCurrency}</span>
                  <ArrowRight className="w-3 h-3 text-white/30" />
                  <span className="text-flux-orange font-bold">
                    {item.output.toLocaleString(numberLocale, { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/40">{item.outputCurrency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
