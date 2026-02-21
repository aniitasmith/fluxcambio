'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Input } from '@/components/ui/input';
import { ResultCard } from './ResultCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { saveConversionHistory } from '@/lib/storage';
import { CONVERSION_MODES } from '@/lib/constants';
import { MapPin, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CadConverterProps {
  cadToUsd: number;
  bcvUsd: number;
  binanceRate: number;
  isLoading?: boolean;
}

type Direction = 'cad-to-all' | 'all-to-cad';

export function CadConverter({ 
  cadToUsd, 
  bcvUsd, 
  binanceRate,
  isLoading = false,
}: CadConverterProps) {
  const { t, language } = useLanguage();
  const { formatInputValue, displayValue } = useNumberFormat();
  
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<Direction>('cad-to-all');
  
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value, amount);
    setAmount(formatted);
  }, [formatInputValue, amount]);
  
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  
  const conversions = useMemo(() => {
    // CAD → All conversions
    const usdFromCad = cadToUsd > 0 ? numericAmount * cadToUsd : null;
    const vesFromCad = usdFromCad && bcvUsd > 0 ? usdFromCad * bcvUsd : null;
    const usdtFromCad = vesFromCad && binanceRate > 0 ? vesFromCad / binanceRate : null;
    
    // USDT → CAD (reverse)
    const vesFromUsdt = binanceRate > 0 ? numericAmount * binanceRate : null;
    const usdFromUsdt = vesFromUsdt && bcvUsd > 0 ? vesFromUsdt / bcvUsd : null;
    const cadFromUsdt = usdFromUsdt && cadToUsd > 0 ? usdFromUsdt / cadToUsd : null;
    
    return { usdFromCad, vesFromCad, usdtFromCad, vesFromUsdt, usdFromUsdt, cadFromUsdt };
  }, [numericAmount, cadToUsd, bcvUsd, binanceRate]);
  
  const { usdFromCad, vesFromCad, usdtFromCad, vesFromUsdt, usdFromUsdt, cadFromUsdt } = conversions;
  
  const saveToHistory = useCallback((
    inputVal: number,
    inputCurrency: string,
    outputVal: number,
    outputCurrency: string,
    rate: number
  ) => {
    if (inputVal > 0 && outputVal > 0) {
      saveConversionHistory({
        mode: CONVERSION_MODES.CAD,
        input: inputVal,
        inputCurrency,
        output: outputVal,
        outputCurrency,
        rate,
      });
    }
  }, []);
  
  useEffect(() => {
    if (numericAmount > 0) {
      const timer = setTimeout(() => {
        if (direction === 'cad-to-all' && usdtFromCad) {
          saveToHistory(numericAmount, 'CAD', usdtFromCad, 'USDT', binanceRate);
        } else if (direction === 'all-to-cad' && cadFromUsdt) {
          saveToHistory(numericAmount, 'USDT', cadFromUsdt, 'CAD', cadToUsd);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [numericAmount, usdtFromCad, cadFromUsdt, direction, binanceRate, cadToUsd, saveToHistory]);
  
  useEffect(() => {
    setAmount('');
  }, [direction]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <p className="text-sm text-white/60">
            {t.cad.description}
          </p>
        </div>
      </div>
      
      {/* Direction Toggle */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
        <button
          onClick={() => setDirection('cad-to-all')}
          className={cn(
            'flex-1 py-2 px-3 text-sm rounded-lg transition-all flex items-center justify-center gap-2',
            direction === 'cad-to-all'
              ? 'bg-blue-500 text-white'
              : 'text-white/60 hover:text-white'
          )}
        >
          <span className="font-bold">CAD</span>
          <ArrowLeftRight className="w-4 h-4" />
          <span>USD / VES / USDT</span>
        </button>
        <button
          onClick={() => setDirection('all-to-cad')}
          className={cn(
            'flex-1 py-2 px-3 text-sm rounded-lg transition-all flex items-center justify-center gap-2',
            direction === 'all-to-cad'
              ? 'bg-flux-orange text-black'
              : 'text-white/60 hover:text-white'
          )}
        >
          <span className="font-bold">USDT</span>
          <ArrowLeftRight className="w-4 h-4" />
          <span>VES / USD / CAD</span>
        </button>
      </div>
      
      {direction === 'cad-to-all' ? (
        <>
          <div>
            <label className="text-sm text-white/60 mb-2 block">
              {t.calculator.cadLabel}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold">C$</span>
              <Input
                type="text"
                inputMode="decimal"
                value={displayValue(amount)}
                onChange={handleAmountChange}
                placeholder={t.calculator.placeholder}
                className="glass-input h-14 pl-12 text-2xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-blue-400/50 focus:ring-blue-400/20"
              />
            </div>
          </div>
          
          <div className="grid gap-3">
            <ResultCard
              label={t.results.usdFromCad}
              sublabel={`CAD × ${cadToUsd.toFixed(4)} (${t.cad.cadRate})`}
              value={usdFromCad}
              currency="USD"
              isLoading={isLoading}
            />
            <ResultCard
              label={t.results.vesFromCad}
              sublabel={t.results.vesFromCadSub}
              value={vesFromCad}
              currency="Bs"
              isLoading={isLoading}
            />
            <ResultCard
              label={t.results.usdtFromCad}
              sublabel={t.results.usdtFromCadSub}
              value={usdtFromCad}
              currency="USDT"
              highlight
              isLoading={isLoading}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="text-sm text-white/60 mb-2 block">
              {t.calculator.amountUsdtLabel}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-flux-orange font-bold">₮</span>
              <Input
                type="text"
                inputMode="decimal"
                value={displayValue(amount)}
                onChange={handleAmountChange}
                placeholder={t.calculator.placeholder}
                className="glass-input h-14 pl-12 text-2xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-flux-orange/50 focus:ring-flux-orange/20"
              />
            </div>
          </div>
          
          <div className="grid gap-3">
            <ResultCard
              label={t.results.vesEquivalent}
              sublabel={t.results.usdtTimesBinanceRate}
              value={vesFromUsdt}
              currency="Bs"
              isLoading={isLoading}
            />
            <ResultCard
              label={t.results.usdEquivalent}
              sublabel={t.results.usdEquivalentSub}
              value={usdFromUsdt}
              currency="USD"
              isLoading={isLoading}
            />
            <ResultCard
              label={t.results.cadFromUsdt}
              sublabel={t.results.cadFromUsdtSub}
              value={cadFromUsdt}
              currency="CAD"
              highlight
              isLoading={isLoading}
            />
          </div>
        </>
      )}
      
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-xs text-white/40">
          {t.cad.usefulFor}
        </p>
      </div>
    </div>
  );
}
