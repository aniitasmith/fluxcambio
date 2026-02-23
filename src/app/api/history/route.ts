import { EXTERNAL_APIS } from '@/lib/constants';
import { fetchWithTimeout, createSuccessResponse, logApiError } from '@/lib/api-utils';
import { NextRequest } from 'next/server';
import { format, subDays } from 'date-fns';

export const revalidate = 3600; // 1 hour

export interface HistoryRatesResponse {
  cadByDate: Record<string, number>;
  bcvByDate?: Record<string, number>;
  bcvEurByDate?: Record<string, number>;
}

const VALID_DAYS = [7, 30, 90] as const;

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && isFinite(value) && value > 0;
}

export async function GET(request: NextRequest) {
  const daysParam = request.nextUrl.searchParams.get('days');
  const days = VALID_DAYS.includes(Number(daysParam) as (typeof VALID_DAYS)[number])
    ? Number(daysParam)
    : 90;

  const result: HistoryRatesResponse = {
    cadByDate: {},
  };

  // CAD from Bank of Canada
  try {
    const cadUrl = `${EXTERNAL_APIS.BANK_OF_CANADA_VALET}/observations/FXCADUSD/json?recent=${Math.min(days * 2, 120)}`;
    const response = await fetchWithTimeout(cadUrl, { timeout: 10000, revalidate: 3600 });
    if (response.ok) {
      const data = await response.json();
      const observations = data?.observations ?? [];
      for (const obs of observations) {
        const dateStr = obs?.d;
        const value = obs?.FXCADUSD?.v;
        if (dateStr && value != null) {
          const rate = parseFloat(String(value));
          if (!Number.isNaN(rate)) result.cadByDate[dateStr] = rate;
        }
      }
    }
  } catch (error) {
    logApiError('History-CAD', error);
  }

  // BCV history from DolarVzla (requires DOLARVZLA_API_KEY)
  const apiKey = process.env.DOLARVZLA_API_KEY;
  if (apiKey) {
    try {
      const toDate = new Date();
      const fromDate = subDays(toDate, days);
      const from = format(fromDate, 'yyyy-MM-dd');
      const to = format(toDate, 'yyyy-MM-dd');
      const bcvUrl = `${EXTERNAL_APIS.DOLARVZLA_BCV_HISTORY}?from=${from}&to=${to}`;
      const response = await fetchWithTimeout(bcvUrl, {
        timeout: 10000,
        revalidate: 3600,
        headers: { 'x-dolarvzla-key': apiKey },
      });
      if (response.ok) {
        const data = await response.json();
        const rates: Array<{ date?: string; usd?: number; eur?: number }> = data?.rates ?? [];
        const bcvByDate: Record<string, number> = {};
        const bcvEurByDate: Record<string, number> = {};
        for (const r of rates) {
          const dateStr = r?.date;
          if (!dateStr) continue;
          if (isValidNumber(r.usd)) bcvByDate[dateStr] = r.usd;
          if (isValidNumber(r.eur)) bcvEurByDate[dateStr] = r.eur;
        }
        if (Object.keys(bcvByDate).length > 0) result.bcvByDate = bcvByDate;
        if (Object.keys(bcvEurByDate).length > 0) result.bcvEurByDate = bcvEurByDate;
      }
    } catch (error) {
      logApiError('History-BCV', error);
    }
  }

  return createSuccessResponse(result);
}
