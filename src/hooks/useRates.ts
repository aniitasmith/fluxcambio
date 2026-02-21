'use client';

import useSWR from 'swr';
import { API_ENDPOINTS, type BCVData, type BinanceData, type CADData } from '@/lib/constants';
import { saveRateHistory } from '@/lib/storage';
import { useEffect } from 'react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useRates() {
  const { 
    data: bcvData, 
    error: bcvError, 
    isLoading: bcvLoading,
    mutate: mutateBcv,
  } = useSWR<BCVData>(API_ENDPOINTS.BCV, fetcher, {
    refreshInterval: 20 * 60 * 1000,
    revalidateOnFocus: false,
  });
  
  const { 
    data: binanceData, 
    error: binanceError, 
    isLoading: binanceLoading,
    mutate: mutateBinance,
  } = useSWR<BinanceData>(API_ENDPOINTS.BINANCE, fetcher, {
    refreshInterval: 20 * 60 * 1000,
    revalidateOnFocus: false,
  });
  
  const { 
    data: cadData, 
    error: cadError, 
    isLoading: cadLoading,
    mutate: mutateCad,
  } = useSWR<CADData>(API_ENDPOINTS.CAD, fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: false,
  });
  
  useEffect(() => {
    if (bcvData && binanceData && cadData) {
      saveRateHistory({
        bcvUsd: bcvData.usd,
        bcvEur: bcvData.eur,
        binance: binanceData.totalBid,
        cadUsd: cadData.usd,
      });
    }
  }, [bcvData, binanceData, cadData]);
  
  const refreshAll = async () => {
    await Promise.all([
      mutateBcv(),
      mutateBinance(),
      mutateCad(),
    ]);
  };
  
  const isLoading = bcvLoading || binanceLoading || cadLoading;
  const hasError = bcvError || binanceError || cadError;
  
  return {
    bcv: bcvData,
    binance: binanceData,
    cad: cadData,
    isLoading,
    hasError,
    refreshAll,
    errors: {
      bcv: bcvError,
      binance: binanceError,
      cad: cadError,
    },
  };
}
