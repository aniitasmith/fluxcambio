'use client';

import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface RateCardProps {
  label: string;
  value: number | undefined;
  suffix?: string;
  icon?: 'dollar' | 'trending' | 'coins';
  isLoading?: boolean;
  color?: 'orange' | 'gold' | 'green' | 'blue';
  locale?: string;
}

const numberLocale = (lang: string) => (lang === 'es' ? 'es-VE' : 'en-US');

const RateCard = memo(function RateCard({ 
  label, 
  value, 
  suffix = 'Bs', 
  icon = 'dollar',
  isLoading = false,
  color = 'orange',
  locale = 'en-US',
}: RateCardProps) {
  const IconComponent = {
    dollar: DollarSign,
    trending: TrendingUp,
    coins: Coins,
  }[icon];
  
  const colorClasses = {
    orange: 'text-flux-orange',
    gold: 'text-flux-gold',
    green: 'text-emerald-400',
    blue: 'text-blue-400',
  }[color];

  const bgClasses = {
    orange: 'bg-flux-orange/10',
    gold: 'bg-flux-gold/10',
    green: 'bg-emerald-500/10',
    blue: 'bg-blue-500/10',
  }[color];
  
  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg p-2 text-center">
        <Skeleton className="h-3 w-16 mx-auto mb-1.5 bg-white/10" />
        <Skeleton className="h-5 w-20 mx-auto bg-white/10" />
      </div>
    );
  }
  
  return (
    <div 
      className={cn("rounded-lg p-2 text-center transition-all hover:scale-105", bgClasses)}
      role="status"
      aria-label={`${label}: ${value ? value.toLocaleString(locale, { minimumFractionDigits: 2 }) : '--'} ${suffix}`}
    >
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <IconComponent className={cn("w-3 h-3", colorClasses)} aria-hidden="true" />
        <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline justify-center gap-1">
        <span className={cn("text-base sm:text-lg font-bold", colorClasses)}>
          {value ? value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
        </span>
        <span className="text-[10px] text-white/40">{suffix}</span>
      </div>
    </div>
  );
});

interface RatesPanelProps {
  bcvUsd?: number;
  bcvEur?: number;
  binance?: number;
  cadUsd?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  compact?: boolean;
}

export function RatesPanel({ 
  bcvUsd, 
  bcvEur, 
  binance, 
  cadUsd,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  compact = false,
}: RatesPanelProps) {
  const { t, language } = useLanguage();
  const locale = numberLocale(language);

  return (
    <div className={cn("glass-card rounded-xl p-3", !compact && "mb-6")}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-white/60">{t.rates.title}</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            title={t.rates.refresh}
            aria-label={t.rates.refresh}
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-white/60', isRefreshing && 'animate-spin')} aria-hidden="true" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <RateCard 
          label={t.rates.bcvUsd}
          value={bcvUsd} 
          icon="dollar" 
          isLoading={isLoading}
          color="orange"
          locale={locale}
        />
        <RateCard 
          label={t.rates.bcvEur}
          value={bcvEur} 
          icon="dollar" 
          isLoading={isLoading}
          color="gold"
          locale={locale}
        />
        <RateCard 
          label={t.rates.binance}
          value={binance} 
          icon="coins" 
          isLoading={isLoading}
          color="green"
          locale={locale}
        />
        <RateCard 
          label={t.rates.cadUsd}
          value={cadUsd} 
          suffix="USD"
          icon="trending" 
          isLoading={isLoading}
          color="blue"
          locale={locale}
        />
      </div>
    </div>
  );
}
