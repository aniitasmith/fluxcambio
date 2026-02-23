import { type RateHistoryItem } from './constants';
import { startOfDay, subDays, format } from 'date-fns';

export interface HistoryRatesResponse {
  cadByDate: Record<string, number>;
  bcvByDate?: Record<string, number>;
  bcvEurByDate?: Record<string, number>;
}

/**
 * Merges API historical rates (e.g. Bank of Canada CAD) with local rate history.
 * API data fills gaps so the chart shows past days even if the user didn't open the app.
 * BCV and Binance stay from local storage (no public historical API used here).
 */
export function mergeRateHistory(
  localHistory: RateHistoryItem[],
  apiHistory: HistoryRatesResponse | null,
  days: number
): RateHistoryItem[] {
  const dayKeys: string[] = [];
  for (let i = 0; i < days; i++) {
    dayKeys.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  const uniqueDays = Array.from(new Set(dayKeys)).sort();

  const localByDay: Record<string, RateHistoryItem> = {};
  for (const item of localHistory) {
    const key = format(new Date(item.timestamp), 'yyyy-MM-dd');
    if (!localByDay[key] || item.timestamp > localByDay[key].timestamp) {
      localByDay[key] = item;
    }
  }

  // For each day without local data, use the most recent local entry ON OR BEFORE that day (never future data).
  // This way we show real variation when we have multiple days of data, and 0 when we have no data yet for that date.
  const sortedLocal = localHistory.slice().sort((a, b) => b.timestamp - a.timestamp); // newest first
  const lastKnownOnOrBefore: Record<string, RateHistoryItem> = {};
  for (const dayKey of uniqueDays) {
    const entry = sortedLocal.find(
      (item) => format(new Date(item.timestamp), 'yyyy-MM-dd') <= dayKey
    );
    if (entry) lastKnownOnOrBefore[dayKey] = entry;
  }

  let prevCadUsd = 0;
  let prevBcvUsd = 0;
  let prevBcvEur = 0;
  let prevBinance = 0;
  const merged: RateHistoryItem[] = [];

  for (const dayKey of uniqueDays) {
    const [y, m, d] = dayKey.split('-').map(Number);
    const timestamp = startOfDay(new Date(y, m - 1, d)).getTime();
    const local = localByDay[dayKey];
    const fallback = local ?? lastKnownOnOrBefore[dayKey];

    const cadUsd = apiHistory?.cadByDate[dayKey] ?? local?.cadUsd ?? prevCadUsd;
    let bcvUsd = apiHistory?.bcvByDate?.[dayKey] ?? fallback?.bcvUsd ?? 0;
    let bcvEur = apiHistory?.bcvEurByDate?.[dayKey] ?? fallback?.bcvEur ?? 0;
    let binance = fallback?.binance ?? 0;
    if (binance <= 0 && prevBinance > 0) binance = prevBinance;
    if (binance > 0) prevBinance = binance;

    if (bcvUsd <= 0 && prevBcvUsd > 0) bcvUsd = prevBcvUsd;
    if (bcvEur <= 0 && prevBcvEur > 0) bcvEur = prevBcvEur;
    if (bcvUsd > 0) prevBcvUsd = bcvUsd;
    if (bcvEur > 0) prevBcvEur = bcvEur;

    if (local) prevCadUsd = local.cadUsd;
    if (apiHistory?.cadByDate[dayKey] != null) {
      prevCadUsd = apiHistory.cadByDate[dayKey];
    }

    const hasAnyRate = cadUsd > 0 || bcvUsd > 0 || bcvEur > 0 || binance > 0;
    if (hasAnyRate) {
      merged.push({ timestamp, bcvUsd, bcvEur, binance, cadUsd });
    }
  }

  return merged.sort((a, b) => a.timestamp - b.timestamp);
}
