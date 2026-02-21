'use client';

import { memo, useState, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResultCardProps {
  label: string;
  value: number | null;
  currency: string;
  sublabel?: string;
  highlight?: boolean;
  isLoading?: boolean;
}

const numberLocale = (lang: string) => (lang === 'es' ? 'es-VE' : 'en-US');

export const ResultCard = memo(function ResultCard({ 
  label, 
  value, 
  currency, 
  sublabel,
  highlight = false,
  isLoading = false,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();
  const locale = numberLocale(language);
  
  const handleCopy = useCallback(async () => {
    if (value === null) return;
    
    try {
      await navigator.clipboard.writeText(value.toFixed(2));
      setCopied(true);
      toast.success(t.actions.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t.actions.copyError);
    }
  }, [value, t.actions.copied, t.actions.copyError]);
  
  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <Skeleton className="h-4 w-20 mb-2 bg-white/10" />
        <Skeleton className="h-8 w-32 bg-white/10" />
      </GlassCard>
    );
  }
  
  const formattedValue = value !== null 
    ? value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '--';
  
  return (
    <GlassCard 
      className={cn(
        'p-4 transition-all duration-300 group cursor-pointer hover:scale-[1.02]',
        highlight && 'glow-orange border-flux-orange/30'
      )}
      onClick={handleCopy}
      role="button"
      aria-label={`${label}: ${formattedValue} ${currency}. ${t.actions.copy}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCopy();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1" aria-hidden="true">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-white/30 mb-1" aria-hidden="true">{sublabel}</p>
          )}
          <div className="flex items-baseline gap-2">
            <span 
              className={cn(
                'text-2xl font-bold',
                highlight ? 'gradient-text' : 'text-white'
              )}
              aria-live="polite"
            >
              {formattedValue}
            </span>
            <span className="text-sm text-white/50" aria-hidden="true">{currency}</span>
          </div>
        </div>
        
        <button 
          className="p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          aria-label={t.actions.copy}
          tabIndex={-1}
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4 text-white/50" aria-hidden="true" />
          )}
        </button>
      </div>
    </GlassCard>
  );
});
