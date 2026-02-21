'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassCard } from './GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { Trophy, DollarSign, Coins, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArbitrageCompareProps {
  bcvUsd: number;
  bcvEur: number;
  binanceRate: number;
  cadRate: number;
  isLoading?: boolean;
}

type RateType = 'bcv-usd' | 'bcv-eur' | 'binance' | 'custom';
type InputMode = 'bs' | 'usd';

export function ArbitrageCompare({ 
  bcvUsd, 
  bcvEur, 
  binanceRate,
  cadRate,
}: ArbitrageCompareProps) {
  const { t, language } = useLanguage();
  const { formatInputValue, displayValue, formatNumber } = useNumberFormat();
  const numberLocale = language === 'es' ? 'es-VE' : 'en-US';
  
  const [priceUsd, setPriceUsd] = useState('');
  const [priceBs, setPriceBs] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('bs');
  const [selectedRate, setSelectedRate] = useState<RateType>('bcv-usd');
  const [customRate, setCustomRate] = useState('');
  const [usdForBs, setUsdForBs] = useState('');
  
  const getCurrentRate = useCallback((): number => {
    switch (selectedRate) {
      case 'bcv-usd': return bcvUsd;
      case 'bcv-eur': return bcvEur;
      case 'binance': return binanceRate;
      case 'custom': return parseFloat(customRate) || 0;
      default: return 0;
    }
  }, [selectedRate, bcvUsd, bcvEur, binanceRate, customRate]);
  
  useEffect(() => {
    if (inputMode === 'usd' && usdForBs) {
      const usdValue = parseFloat(usdForBs) || 0;
      const rate = getCurrentRate();
      setPriceBs((usdValue * rate).toString());
    }
  }, [getCurrentRate, inputMode, usdForBs]);
  
  const handleUsdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value, priceUsd);
    setPriceUsd(formatted);
  }, [formatInputValue, priceUsd]);
  
  const handleBsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value, priceBs);
    setPriceBs(formatted);
  }, [formatInputValue, priceBs]);
  
  const handleUsdForBsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value, usdForBs);
    setUsdForBs(formatted);
    const usdValue = parseFloat(formatted) || 0;
    const rate = getCurrentRate();
    setPriceBs((usdValue * rate).toString());
  }, [formatInputValue, usdForBs, getCurrentRate]);
  
  const handleCustomRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value, customRate);
    setCustomRate(formatted);
    if (usdForBs && inputMode === 'usd') {
      const usdValue = parseFloat(usdForBs) || 0;
      const rate = parseFloat(formatted) || 0;
      setPriceBs((usdValue * rate).toString());
    }
  }, [formatInputValue, customRate, usdForBs, inputMode]);
  
  const calculations = useMemo(() => {
    const priceUsdValue = parseFloat(priceUsd) || 0;
    const priceBsValue = parseFloat(priceBs) || 0;
    const realCostInUsd = binanceRate > 0 ? priceBsValue / binanceRate : 0;
    
    const priceInCad = cadRate > 0 ? priceUsdValue / cadRate : 0;
    const realCostInCad = cadRate > 0 ? realCostInUsd / cadRate : 0;
    
    const difference = priceUsdValue - realCostInUsd;
    const percentDiff = priceUsdValue > 0 ? (difference / priceUsdValue) * 100 : 0;
    
    const recommendation = difference > 0 ? 'bs' : difference < 0 ? 'usd' : 'equal';
    const savings = Math.abs(difference);
    const savingsInCad = cadRate > 0 ? savings / cadRate : 0;
    
    return {
      priceUsdValue,
      priceBsValue,
      realCostInUsd,
      priceInCad,
      realCostInCad,
      difference,
      percentDiff,
      recommendation,
      savings,
      savingsInCad,
    };
  }, [priceUsd, priceBs, binanceRate, cadRate]);
  
  const { 
    priceUsdValue, priceBsValue, realCostInUsd, priceInCad, 
    realCostInCad, percentDiff, recommendation, savings, savingsInCad 
  } = calculations;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price in Dollars */}
        <div>
          <label className="text-sm text-white/60 mb-3 flex items-center gap-2 h-6">
            <DollarSign className="w-4 h-4 text-flux-orange" aria-hidden="true" />
            {t.arbitrage.priceInDollars}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-flux-orange font-bold" aria-hidden="true">$</span>
            <Input
              type="text"
              inputMode="decimal"
              value={displayValue(priceUsd)}
              onChange={handleUsdChange}
              placeholder={t.calculator.placeholder}
              aria-label={t.arbitrage.priceInDollars}
              className="glass-input h-12 pl-10 text-xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-flux-orange/50"
            />
          </div>
          {priceUsdValue > 0 && cadRate > 0 && (
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              ≈ C${priceInCad.toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD
            </p>
          )}
        </div>
        
        {/* Price in Bolivares */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3 min-h-6">
            <label className="text-sm text-white/60 flex items-center gap-2">
              <Coins className="w-4 h-4 text-flux-gold" aria-hidden="true" />
              {t.arbitrage.priceInBolivares}
            </label>
            <div className="flex gap-1 ml-auto sm:ml-0">
              <button
                onClick={() => setInputMode('bs')}
                aria-pressed={inputMode === 'bs'}
                className={cn(
                  'px-2 py-0.5 text-[10px] sm:text-xs rounded-md transition-all font-medium',
                  inputMode === 'bs' 
                    ? 'bg-flux-gold text-black' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                {t.arbitrage.bs}
              </button>
              <button
                onClick={() => setInputMode('usd')}
                aria-pressed={inputMode === 'usd'}
                className={cn(
                  'px-2 py-0.5 text-[10px] sm:text-xs rounded-md transition-all font-medium',
                  inputMode === 'usd' 
                    ? 'bg-flux-gold text-black' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                {t.arbitrage.usdRate}
              </button>
            </div>
          </div>
          
          {inputMode === 'bs' ? (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-flux-gold font-bold text-sm" aria-hidden="true">Bs</span>
              <Input
                type="text"
                inputMode="decimal"
                value={displayValue(priceBs)}
                onChange={handleBsChange}
                placeholder={t.calculator.placeholder}
                aria-label={t.arbitrage.priceInBolivares}
                className="glass-input h-12 pl-10 text-xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-flux-gold/50"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-flux-gold font-bold text-sm" aria-hidden="true">$</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={displayValue(usdForBs)}
                    onChange={handleUsdForBsChange}
                    placeholder={t.calculator.placeholder}
                    aria-label={t.aria.amountUsdConvert}
                    className="glass-input h-12 pl-8 text-xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-flux-gold/50"
                  />
                </div>
                <Select value={selectedRate} onValueChange={(v) => setSelectedRate(v as RateType)}>
                  <SelectTrigger 
                    className="w-24 sm:w-28 glass-input border-white/10 text-white text-[10px] sm:text-xs h-12"
                    aria-label={t.aria.selectRate}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-flux-dark border-white/10">
                    <SelectItem value="bcv-usd" className="text-white">BCV USD</SelectItem>
                    <SelectItem value="bcv-eur" className="text-white">BCV EUR</SelectItem>
                    <SelectItem value="binance" className="text-white">Binance</SelectItem>
                    <SelectItem value="custom" className="text-white">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRate === 'custom' && (
                <Input
                  type="text"
                  inputMode="decimal"
                  value={displayValue(customRate)}
                  onChange={handleCustomRateChange}
                  placeholder={t.arbitrage.customRate}
                  aria-label={t.arbitrage.customRate}
                  className="glass-input h-10 text-sm text-white placeholder:text-white/30 border-white/10"
                />
              )}
              
              <p className="text-xs text-white/40" aria-live="polite">
                = {displayValue(priceBs)} Bs
              </p>
            </div>
          )}
        </div>
      </div>
      
      {(priceUsdValue > 0 || priceBsValue > 0) && (
        <GlassCard 
          className={cn(
            'p-4 transition-all',
            recommendation === 'bs' && 'border-emerald-500/30 glow-gold',
            recommendation === 'usd' && 'border-flux-orange/30 glow-orange'
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'p-2 rounded-xl',
              recommendation === 'bs' ? 'bg-emerald-500/20' : 'bg-flux-orange/20'
            )}>
              <Trophy className={cn(
                'w-6 h-6',
                recommendation === 'bs' ? 'text-emerald-400' : 'text-flux-orange'
              )} />
            </div>
            <div>
              <p className="text-sm text-white/60">{t.arbitrage.recommendation}</p>
              <p className="text-lg font-bold text-white">
                {recommendation === 'bs' && t.arbitrage.payInBolivares}
                {recommendation === 'usd' && t.arbitrage.payInDollars}
                {recommendation === 'equal' && t.arbitrage.bothEqual}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/50 mb-1">{t.arbitrage.costInUsd}</p>
              <p className="text-xl font-bold text-white">
                ${priceUsdValue.toLocaleString(numberLocale, { minimumFractionDigits: 2 })}
              </p>
              {cadRate > 0 && (
                <p className="text-xs text-blue-400 mt-1">
                  ≈ C${priceInCad.toLocaleString(numberLocale, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/50 mb-1">{t.arbitrage.realCostBs}</p>
              <p className="text-xl font-bold text-white">
                ${realCostInUsd.toLocaleString(numberLocale, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-white/40">
                {t.arbitrage.viaBinance}
              </p>
              {cadRate > 0 && (
                <p className="text-xs text-blue-400 mt-1">
                  ≈ C${realCostInCad.toLocaleString(numberLocale, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
          
          {recommendation !== 'equal' && (
            <div className={cn(
              'flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl',
              recommendation === 'bs' ? 'bg-emerald-500/20' : 'bg-flux-orange/20'
            )}>
              <div className="flex items-center gap-2">
                {recommendation === 'bs' ? (
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-flux-orange" />
                )}
                <span className={cn(
                  'font-bold',
                  recommendation === 'bs' ? 'text-emerald-400' : 'text-flux-orange'
                )}>
                  {t.arbitrage.youSave} ${savings.toLocaleString(numberLocale, { minimumFractionDigits: 2 })} USD
                </span>
                <span className="text-white/50 text-sm">
                  ({Math.abs(percentDiff).toFixed(1)}%)
                </span>
              </div>
              {cadRate > 0 && (
                <p className="text-xs text-blue-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  ≈ C${savingsInCad.toLocaleString(numberLocale, { minimumFractionDigits: 2 })} CAD
                </p>
              )}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
