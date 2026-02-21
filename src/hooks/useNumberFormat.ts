'use client';

import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseNumberFormatReturn {
  formatInputValue: (value: string, currentValue?: string) => string;
  displayValue: (value: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  parseLocaleNumber: (value: string) => number;
}

const MAX_INPUT_LENGTH = 15;

export function useNumberFormat(): UseNumberFormatReturn {
  const { language } = useLanguage();
  
  const decimalSeparator = useMemo(() => language === 'es' ? ',' : '.', [language]);
  const thousandsSeparator = useMemo(() => language === 'es' ? '.' : ',', [language]);
  
  const formatInputValue = useCallback((value: string, currentValue: string = ''): string => {
    const rawValue = value
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
    
    if (rawValue === '' || /^[\d.]*$/.test(rawValue)) {
      const dotCount = (rawValue.match(/\./g) || []).length;
      if (dotCount > 1) return currentValue;
      if (rawValue.length > MAX_INPUT_LENGTH) return currentValue;
      return rawValue;
    }
    return currentValue;
  }, [decimalSeparator, thousandsSeparator]);
  
  const displayValue = useCallback((value: string): string => {
    if (!value) return '';
    
    const parts = value.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    return parts.length > 1 
      ? `${integerPart}${decimalSeparator}${parts[1]}` 
      : integerPart;
  }, [decimalSeparator, thousandsSeparator]);
  
  const formatNumber = useCallback((
    value: number, 
    options: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ): string => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return value.toLocaleString(language === 'es' ? 'es-VE' : 'en-US', options);
  }, [language]);
  
  const parseLocaleNumber = useCallback((value: string): number => {
    const normalized = value
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
    return parseFloat(normalized) || 0;
  }, [decimalSeparator, thousandsSeparator]);
  
  return {
    formatInputValue,
    displayValue,
    formatNumber,
    parseLocaleNumber,
  };
}
