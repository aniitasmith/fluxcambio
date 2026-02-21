import { EXTERNAL_APIS, type BinanceData } from '@/lib/constants';
import { 
  fetchWithTimeout, 
  createErrorResponse, 
  createSuccessResponse,
  isValidNumber,
  logApiError,
} from '@/lib/api-utils';

export const revalidate = 1200;

const REVALIDATE_TIME = 1200;

export async function GET() {
  try {
    const response = await fetchWithTimeout(EXTERNAL_APIS.CRIPTOYA_BINANCE, {
      revalidate: REVALIDATE_TIME,
      timeout: 8000,
    });
    
    if (!response.ok) {
      throw new Error(`Binance API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!isValidNumber(data?.totalBid)) {
      throw new Error('Invalid data structure from Binance API');
    }
    
    const result: BinanceData = {
      totalBid: data.totalBid,
      time: data.time || Date.now(),
    };
    
    return createSuccessResponse(result);
  } catch (error) {
    logApiError('Binance', error);
    return createErrorResponse(
      'No se pudo obtener la tasa de Binance',
      'BINANCE_FETCH_ERROR'
    );
  }
}
