export const API_ENDPOINTS = {
  BCV: '/api/bcv',
  BINANCE: '/api/binance',
  CAD: '/api/cad',
  HISTORY: '/api/history',
} as const;

export const EXTERNAL_APIS = {
  DOLARVZLA: 'https://api.dolarvzla.com/public/exchange-rate',
  DOLARAPI_FALLBACK: 'https://ve.dolarapi.com/v1/dolares/oficial',
  CRIPTOYA_BINANCE: 'https://criptoya.com/api/binancep2p/USDT/VES/0.1',
  EXCHANGE_RATE_CAD: 'https://open.er-api.com/v6/latest/CAD',
} as const;

export const CACHE_DURATION = {
  BCV: 20 * 60 * 1000,
  BINANCE: 20 * 60 * 1000,
  CAD: 60 * 60 * 1000,
} as const;

export const STORAGE_KEYS = {
  BCV_CACHE: 'fluxcambio_bcv_cache',
  BINANCE_CACHE: 'fluxcambio_binance_cache',
  CAD_CACHE: 'fluxcambio_cad_cache',
  CONVERSION_HISTORY: 'fluxcambio_history',
  RATE_HISTORY: 'fluxcambio_rate_history',
} as const;

export const MAX_HISTORY_ITEMS = 50;

export const CONVERSION_MODES = {
  REF: 'ref',
  VES: 'ves',
  VS: 'vs',
  CAD: 'cad',
} as const;

export type ConversionMode = typeof CONVERSION_MODES[keyof typeof CONVERSION_MODES];

export interface BCVData {
  usd: number;
  eur: number;
  date: string;
}

export interface BinanceData {
  totalBid: number;
  time: number;
}

export interface CADData {
  usd: number;
  date: string;
}

export interface ConversionHistoryItem {
  id: string;
  mode: ConversionMode;
  input: number;
  inputCurrency: string;
  output: number;
  outputCurrency: string;
  rate: number;
  timestamp: number;
}

export interface RateHistoryItem {
  timestamp: number;
  bcvUsd: number;
  bcvEur: number;
  binance: number;
  cadUsd: number;
}
