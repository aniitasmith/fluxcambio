'use client';

import { 
  STORAGE_KEYS, 
  MAX_HISTORY_ITEMS,
  type ConversionHistoryItem,
  type RateHistoryItem,
} from './constants';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function saveToCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  const cached: CachedData<T> = {
    data,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

export function getFromCache<T>(key: string, maxAge: number): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const parsed: CachedData<T> = JSON.parse(cached);
    const now = Date.now();
    
    if (now - parsed.timestamp < maxAge) {
      return parsed.data;
    }
    
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

export function saveConversionHistory(item: Omit<ConversionHistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getConversionHistory();
    
    const newItem: ConversionHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEYS.CONVERSION_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving conversion history:', error);
  }
}

export function getConversionHistory(): ConversionHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSION_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearConversionHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CONVERSION_HISTORY);
}

export function saveRateHistory(rates: Omit<RateHistoryItem, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getRateHistory();
    const now = Date.now();
    
    const lastEntry = history[history.length - 1];
    if (lastEntry && now - lastEntry.timestamp < 30 * 60 * 1000) {
      return;
    }
    
    const newItem: RateHistoryItem = {
      ...rates,
      timestamp: now,
    };
    
    const maxItems = 24 * 90;
    const updated = [...history, newItem].slice(-maxItems);
    localStorage.setItem(STORAGE_KEYS.RATE_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving rate history:', error);
  }
}

export function getRateHistory(): RateHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RATE_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const DEFAULT_CSV_HEADERS = ['Date', 'Mode', 'Input', 'Input Currency', 'Output', 'Output Currency', 'Rate'] as const;

export function exportHistoryToCSV(headers?: string[]): string {
  const history = getConversionHistory();
  
  if (history.length === 0) return '';
  
  const headerRow = headers ?? [...DEFAULT_CSV_HEADERS];
  const rows = history.map(item => [
    new Date(item.timestamp).toLocaleString('en-US'),
    item.mode.toUpperCase(),
    item.input.toString(),
    item.inputCurrency,
    item.output.toFixed(2),
    item.outputCurrency,
    item.rate.toFixed(4),
  ]);
  
  return [headerRow.join(','), ...rows.map(row => row.join(','))].join('\n');
}
