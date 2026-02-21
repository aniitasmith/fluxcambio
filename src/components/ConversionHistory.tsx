'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  getConversionHistory, 
  clearConversionHistory, 
  exportHistoryToCSV 
} from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { type ConversionHistoryItem } from '@/lib/constants';
import { History, Trash2, Download, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const modeColors: Record<string, string> = {
  ref: 'bg-flux-orange/20 text-flux-orange',
  ves: 'bg-flux-gold/20 text-flux-gold',
  vs: 'bg-purple-500/20 text-purple-400',
  cad: 'bg-blue-500/20 text-blue-400',
};

interface ConversionHistoryProps {
  asDialog?: boolean;
}

export function ConversionHistory({ asDialog = true }: ConversionHistoryProps) {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const locale = language === 'es' ? es : enUS;
  
  useEffect(() => {
    if (isOpen || !asDialog) {
      setHistory(getConversionHistory());
    }
  }, [isOpen, asDialog]);
  
  const handleClear = () => {
    clearConversionHistory();
    setHistory([]);
    toast.success(t.actions.historyCleared);
  };
  
  const handleExport = () => {
    const csv = exportHistoryToCSV([
      t.history.date,
      t.history.mode,
      t.history.input,
      t.history.inputCurrency,
      t.history.output,
      t.history.outputCurrency,
      t.history.rate,
    ]);
    if (!csv) {
      toast.error(t.actions.noDataExport);
      return;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fluxcambio-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t.actions.historyExported);
  };
  
  const HistoryContent = () => (
    <>
      <div className="flex gap-2 mb-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={history.length === 0}
          className="glass-input border-white/10 text-white/70 hover:text-white hover:bg-white/10"
        >
          <Download className="w-4 h-4 mr-1" />
          {t.history.exportCsv}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={history.length === 0}
          className="glass-input border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {t.history.clear}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">{t.history.noHistory}</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full uppercase font-medium',
                  modeColors[item.mode]
                )}>
                  {item.mode}
                </span>
                <span className="text-[10px] text-white/40">
                  {format(new Date(item.timestamp), "dd MMM, HH:mm", { locale })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {item.input.toLocaleString(language === 'es' ? 'es-VE' : 'en-US', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-white/50 text-sm">{item.inputCurrency}</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
                <span className="text-flux-orange font-bold">
                  {item.output.toLocaleString(language === 'es' ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-white/50 text-sm">{item.outputCurrency}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
  
  if (!asDialog) {
    return <HistoryContent />;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="glass hover:bg-white/10 text-white/70 hover:text-white"
        >
          <History className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-flux-dark border-white/10 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-flux-orange" />
            {t.history.title}
          </DialogTitle>
        </DialogHeader>
        <HistoryContent />
      </DialogContent>
    </Dialog>
  );
}
