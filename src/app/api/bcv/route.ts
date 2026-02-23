import { EXTERNAL_APIS, type BCVData } from '@/lib/constants';
import { 
  fetchWithTimeout, 
  createErrorResponse, 
  createSuccessResponse,
  isValidNumber,
  logApiError,
} from '@/lib/api-utils';

export const revalidate = 1200;

const REVALIDATE_TIME = 1200;

const DOLARVZLA_API_KEY = process.env.DOLARVZLA_API_KEY;

export async function GET() {
  try {
    const headers: Record<string, string> = {};
    if (DOLARVZLA_API_KEY) {
      headers['x-dolarvzla-key'] = DOLARVZLA_API_KEY;
    }
    const response = await fetchWithTimeout(EXTERNAL_APIS.DOLARVZLA, {
      revalidate: REVALIDATE_TIME,
      timeout: 8000,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`Primary API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!isValidNumber(data?.current?.usd) || !isValidNumber(data?.current?.eur)) {
      throw new Error('Invalid data structure from primary API');
    }
    
    const result: BCVData = {
      usd: data.current.usd,
      eur: data.current.eur,
      date: data.current.date || new Date().toISOString(),
    };
    
    return createSuccessResponse(result);
  } catch (primaryError) {
    logApiError('BCV-Primary', primaryError);
    
    try {
      const fallbackResponse = await fetchWithTimeout(EXTERNAL_APIS.DOLARAPI_FALLBACK, {
        revalidate: REVALIDATE_TIME,
        timeout: 8000,
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API returned ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!isValidNumber(fallbackData?.promedio)) {
        throw new Error('Invalid data structure from fallback API');
      }
      
      const result: BCVData = {
        usd: fallbackData.promedio,
        eur: fallbackData.promedio * 1.08,
        date: fallbackData.fechaActualizacion || new Date().toISOString(),
      };
      
      return createSuccessResponse(result);
    } catch (fallbackError) {
      logApiError('BCV-Fallback', fallbackError);
      return createErrorResponse(
        'No se pudo obtener la tasa BCV',
        'BCV_FETCH_ERROR'
      );
    }
  }
}
