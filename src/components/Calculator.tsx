'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { GlassCard } from './GlassCard';
import { ResultCard } from './ResultCard';
import { RatesPanel } from './RateDisplay';
import { ArbitrageCompare } from './ArbitrageCompare';
import { CadConverter } from './CadConverter';
import { useRates } from '@/hooks/useRates';
import { useNumberFormat } from '@/hooks/useNumberFormat';
import { useLanguage } from '@/contexts/LanguageContext';
import { saveConversionHistory } from '@/lib/storage';
import { CONVERSION_MODES, type ConversionMode } from '@/lib/constants';
import { DollarSign, Coins, Scale, MapPin } from 'lucide-react';

interface CalculatorProps {
  showRatesPanel?: boolean;
}

export function Calculator({ showRatesPanel = true }: CalculatorProps) {
  const [mode, setMode] = useState<ConversionMode>(CONVERSION_MODES.REF);
  const [amount, setAmount] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { bcv, binance, cad, isLoading, refreshAll } = useRates();
  const { t, language } = useLanguage();
  const { formatInputValue, displayValue } = useNumberFormat();
  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshAll();
    setIsRefreshing(false);
  }, [refreshAll]);
  
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value, amount);
    setAmount(formatted);
  }, [formatInputValue, amount]);
  
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  
  const conversions = useMemo(() => {
    // REF (USD) conversions
    const vesFromUsd = bcv?.usd ? numericAmount * bcv.usd : null;
    const usdtFromUsd = binance?.totalBid && vesFromUsd ? vesFromUsd / binance.totalBid : null;
    const cadFromUsd = cad?.usd && numericAmount ? numericAmount / cad.usd : null;
    
    // VES conversions
    const usdFromVes = bcv?.usd && numericAmount ? numericAmount / bcv.usd : null;
    const usdtFromVes = binance?.totalBid && numericAmount ? numericAmount / binance.totalBid : null;
    const cadFromVes = usdFromVes && cad?.usd ? usdFromVes / cad.usd : null;
    
    return { vesFromUsd, usdtFromUsd, cadFromUsd, usdFromVes, usdtFromVes, cadFromVes };
  }, [numericAmount, bcv?.usd, binance?.totalBid, cad?.usd]);
  
  const { vesFromUsd, usdtFromUsd, cadFromUsd, usdFromVes, usdtFromVes, cadFromVes } = conversions;
  
  const saveToHistory = useCallback((
    inputVal: number,
    inputCurrency: string,
    outputVal: number,
    outputCurrency: string,
    rate: number
  ) => {
    if (inputVal > 0 && outputVal > 0) {
      saveConversionHistory({
        mode,
        input: inputVal,
        inputCurrency,
        output: outputVal,
        outputCurrency,
        rate,
      });
    }
  }, [mode]);
  
  useEffect(() => {
    if (mode === CONVERSION_MODES.REF && numericAmount > 0 && usdtFromUsd) {
      const timer = setTimeout(() => {
        saveToHistory(numericAmount, 'USD', usdtFromUsd, 'USDT', binance?.totalBid || 0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [numericAmount, usdtFromUsd, mode, binance?.totalBid, saveToHistory]);
  
  useEffect(() => {
    setAmount('');
  }, [mode]);
  
  return (
    <div className="space-y-6">
      {showRatesPanel && (
        <RatesPanel
          bcvUsd={bcv?.usd}
          bcvEur={bcv?.eur}
          binance={binance?.totalBid}
          cadUsd={cad?.usd}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}
      
      <GlassCard glow className="overflow-hidden">
        <Tabs value={mode} onValueChange={(v) => setMode(v as ConversionMode)}>
          <TabsList 
            className="grid grid-cols-4 w-full max-w-sm mx-auto bg-white/5 p-1 rounded-xl mb-3"
            aria-label={t.aria.conversionModes}
          >
            <TabsTrigger 
              value={CONVERSION_MODES.REF}
              className="data-[state=active]:bg-flux-orange data-[state=active]:text-black rounded-lg transition-all"
              aria-label={t.tabs.refDesc}
              title={t.tabs.refDesc}
            >
              <DollarSign className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {t.tabs.ref}
            </TabsTrigger>
            <TabsTrigger 
              value={CONVERSION_MODES.VES}
              className="data-[state=active]:bg-flux-orange data-[state=active]:text-black rounded-lg transition-all"
              aria-label={t.tabs.vesDesc}
              title={t.tabs.vesDesc}
            >
              <Coins className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {t.tabs.ves}
            </TabsTrigger>
            <TabsTrigger 
              value={CONVERSION_MODES.VS}
              className="data-[state=active]:bg-flux-orange data-[state=active]:text-black rounded-lg transition-all"
              aria-label={t.tabs.vsDesc}
              title={t.tabs.vsDesc}
            >
              <Scale className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {t.tabs.vs}
            </TabsTrigger>
            <TabsTrigger 
              value={CONVERSION_MODES.CAD}
              className="data-[state=active]:bg-flux-orange data-[state=active]:text-black rounded-lg transition-all"
              aria-label={t.tabs.cadDesc}
              title={t.tabs.cadDesc}
            >
              <MapPin className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {t.tabs.cad}
            </TabsTrigger>
          </TabsList>
          
          {/* Mode description */}
          <p className="text-xs text-white/50 text-center mb-4 px-2" role="status" aria-live="polite">
            {mode === CONVERSION_MODES.REF && t.tabs.refDesc}
            {mode === CONVERSION_MODES.VES && t.tabs.vesDesc}
            {mode === CONVERSION_MODES.VS && t.tabs.vsDesc}
            {mode === CONVERSION_MODES.CAD && t.tabs.cadDesc}
          </p>
          
          {/* REF (USD) Mode - Shows VES, USDT, CAD */}
          <TabsContent value={CONVERSION_MODES.REF} className="space-y-4 mt-0">
            <div>
              <label htmlFor="ref-input" className="text-sm text-white/60 mb-2 block">
                {t.calculator.refLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-flux-orange font-bold" aria-hidden="true">$</span>
                <Input
                  id="ref-input"
                  type="text"
                  inputMode="decimal"
                  value={displayValue(amount)}
                  onChange={handleAmountChange}
                  placeholder={t.calculator.placeholder}
                  aria-label={t.calculator.refLabel}
                  aria-describedby="ref-description"
                  className="glass-input h-14 pl-10 text-2xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-flux-orange/50 focus:ring-flux-orange/20"
                />
                <span id="ref-description" className="sr-only">
                  {t.tabs.refDesc}
                </span>
              </div>
            </div>
            
            <div className="grid gap-3">
              <ResultCard
                label={t.results.vesOficial}
                sublabel={t.results.vesOfficialSub}
                value={vesFromUsd}
                currency="Bs"
                isLoading={isLoading}
              />
              <ResultCard
                label={t.results.usdtNeeded}
                sublabel={t.results.usdtNeededSub}
                value={usdtFromUsd}
                currency="USDT"
                highlight
                isLoading={isLoading}
              />
              <ResultCard
                label={t.results.cadEquivalent}
                sublabel={t.results.cadEquivalentSub}
                value={cadFromUsd}
                currency="CAD"
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          {/* VES Mode - Shows USD, USDT, CAD */}
          <TabsContent value={CONVERSION_MODES.VES} className="space-y-4 mt-0">
            <div>
              <label htmlFor="ves-input" className="text-sm text-white/60 mb-2 block">
                {t.calculator.vesLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-flux-gold font-bold" aria-hidden="true">Bs</span>
                <Input
                  id="ves-input"
                  type="text"
                  inputMode="decimal"
                  value={displayValue(amount)}
                  onChange={handleAmountChange}
                  placeholder={t.calculator.placeholder}
                  aria-label={t.calculator.vesLabel}
                  aria-describedby="ves-description"
                  className="glass-input h-14 pl-12 text-2xl font-bold text-white placeholder:text-white/30 border-white/10 focus:border-flux-gold/50 focus:ring-flux-gold/20"
                />
                <span id="ves-description" className="sr-only">
                  {t.tabs.vesDesc}
                </span>
              </div>
            </div>
            
            <div className="grid gap-3">
              <ResultCard
                label={t.results.usdEquivalent}
                sublabel={t.results.usdEquivalentSub}
                value={usdFromVes}
                currency="USD"
                isLoading={isLoading}
              />
              <ResultCard
                label={t.results.usdtEquivalent}
                sublabel={t.results.usdtEquivalentSub}
                value={usdtFromVes}
                currency="USDT"
                highlight
                isLoading={isLoading}
              />
              <ResultCard
                label={t.results.cadFromVes}
                sublabel={t.results.cadFromVesSub}
                value={cadFromVes}
                currency="CAD"
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value={CONVERSION_MODES.VS} className="mt-0">
            <ArbitrageCompare
              bcvUsd={bcv?.usd || 0}
              bcvEur={bcv?.eur || 0}
              binanceRate={binance?.totalBid || 0}
              cadRate={cad?.usd || 0}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value={CONVERSION_MODES.CAD} className="mt-0">
            <CadConverter
              cadToUsd={cad?.usd || 0}
              bcvUsd={bcv?.usd || 0}
              binanceRate={binance?.totalBid || 0}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </GlassCard>
    </div>
  );
}
