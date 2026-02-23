'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { getRateHistory } from '@/lib/storage';
import { mergeRateHistory, type HistoryRatesResponse } from '@/lib/rateHistory';
import { API_ENDPOINTS } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { type RateHistoryItem } from '@/lib/constants';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Period = '7d' | '30d' | '90d';
type RateKey = 'bcvUsd' | 'bcvEur' | 'binance' | 'cadUsd';

const rateConfig: Record<RateKey, { color: string }> = {
  bcvUsd: { color: '#F7931A' },
  bcvEur: { color: '#FFD700' },
  binance: { color: '#10b981' },
  cadUsd: { color: '#3b82f6' },
};

const CHART_RATE_KEYS: RateKey[] = ['bcvUsd', 'bcvEur', 'binance'];

interface RateChartProps {
  asDialog?: boolean;
  height?: number;
}

export function RateChart({ asDialog = true, height = 300 }: RateChartProps) {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<RateHistoryItem[]>([]);
  const [period, setPeriod] = useState<Period>('7d');
  const [selectedRates, setSelectedRates] = useState<RateKey[]>(['bcvUsd', 'binance']);
  const [isOpen, setIsOpen] = useState(false);
  
  const locale = language === 'es' ? es : enUS;
  const numberLocale = language === 'es' ? 'es-VE' : 'en-US';
  
  const rateLabels: Record<RateKey, string> = {
    bcvUsd: t.rates.bcvUsd,
    bcvEur: t.rates.bcvEur,
    binance: t.rates.binance,
    cadUsd: t.rates.cadUsd,
  };
  
  useEffect(() => {
    if (!isOpen && asDialog) return;

    const local = getRateHistory();
    const days = 90;

    setHistory(local);

    fetch(`${API_ENDPOINTS.HISTORY}?days=${days}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((apiData: HistoryRatesResponse | null) => {
        const merged = mergeRateHistory(local, apiData, days);
        setHistory(merged.length > 0 ? merged : local);
      })
      .catch(() => {});
  }, [isOpen, asDialog]);
  
  const filteredData = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = startOfDay(subDays(new Date(), days));
    
    return history
      .filter((item) => item.timestamp >= cutoff.getTime())
      .map((item) => ({
        ...item,
        date: format(new Date(item.timestamp), 'dd/MM', { locale }),
        dateFull: format(new Date(item.timestamp), 'dd MMM yyyy', { locale }),
        time: format(new Date(item.timestamp), 'HH:mm', { locale }),
      }));
  }, [history, period, locale]);
  
  const toggleRate = (rate: RateKey) => {
    if (selectedRates.includes(rate)) {
      if (selectedRates.length > 1) {
        setSelectedRates(selectedRates.filter((r) => r !== rate));
      }
    } else {
      setSelectedRates([...selectedRates, rate]);
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload;
    const dateLabel = point?.dateFull ?? point?.date ?? label;
    
    return (
      <div className="bg-black/95 border border-white/20 rounded-lg px-4 py-3 text-sm shadow-xl backdrop-blur-sm">
        <p className="text-white font-medium mb-2">{dateLabel}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/90">{rateLabels[entry.dataKey as RateKey]}:</span>
            <span className="text-white font-semibold">
              {entry.value?.toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  const ChartContent = ({ inSidebar = false }: { inSidebar?: boolean }) => (
    <div className={cn('flex flex-col min-h-0', inSidebar && 'h-full')}>
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-all',
                period === p 
                  ? 'bg-flux-orange text-black' 
                  : 'text-white/60 hover:text-white'
              )}
            >
              {p === '7d' ? t.chart.days7 : p === '30d' ? t.chart.days30 : t.chart.days90}
            </button>
          ))}
        </div>
        
        <div className="flex gap-1 flex-wrap">
          {CHART_RATE_KEYS.map((rate) => (
            <button
              key={rate}
              onClick={() => toggleRate(rate)}
              className={cn(
                'px-3 py-1 text-xs rounded-lg transition-all border',
                selectedRates.includes(rate)
                  ? 'border-transparent'
                  : 'border-white/10 bg-transparent text-white/40'
              )}
              style={{
                backgroundColor: selectedRates.includes(rate) 
                  ? `${rateConfig[rate].color}30` 
                  : undefined,
                color: selectedRates.includes(rate) 
                  ? rateConfig[rate].color 
                  : undefined,
              }}
            >
              {rateLabels[rate]}
            </button>
          ))}
        </div>
      </div>
      
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{ minHeight: inSidebar ? 150 : height }}
      >
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[150px] text-center">
            <BarChart3 className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/40 mb-2">{t.chart.noData}</p>
            <p className="text-white/30 text-sm">{t.chart.dataCollection}</p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={inSidebar ? 150 : '100%'}
            minHeight={150}
          >
            <LineChart 
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 24 }}
            >
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={24}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff40"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString(numberLocale)}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => (
                  <span className="text-white/70 text-xs">
                    {rateLabels[value as RateKey] || value}
                  </span>
                )}
              />
              {selectedRates
                .filter((rate) => CHART_RATE_KEYS.includes(rate))
                .map((rate) => (
                  <Line
                    key={rate}
                    type="monotone"
                    dataKey={rate}
                    name={rate}
                    stroke={rateConfig[rate].color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: rateConfig[rate].color }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="shrink-0 pt-4 border-t border-white/10">
        <p className="text-xs text-white/30 text-center truncate">{t.chart.localData}</p>
      </div>
    </div>
  );
  
  if (!asDialog) {
    return <ChartContent inSidebar />;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="glass hover:bg-white/10 text-white/70 hover:text-white"
        >
          <BarChart3 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-flux-dark border-white/10 max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-flux-orange" />
            {t.chart.title}
          </DialogTitle>
        </DialogHeader>
        <ChartContent />
      </DialogContent>
    </Dialog>
  );
}
