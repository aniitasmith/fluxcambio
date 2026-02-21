import { EXTERNAL_APIS, type CADData } from '@/lib/constants';
import { 
  fetchWithTimeout, 
  createErrorResponse, 
  createSuccessResponse,
  isValidNumber,
  logApiError,
} from '@/lib/api-utils';

export const revalidate = 3600;

const REVALIDATE_TIME = 3600;

export async function GET() {
  try {
    const response = await fetchWithTimeout(EXTERNAL_APIS.EXCHANGE_RATE_CAD, {
      revalidate: REVALIDATE_TIME,
      timeout: 8000,
    });
    
    if (!response.ok) {
      throw new Error(`CAD API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!isValidNumber(data?.rates?.USD)) {
      throw new Error('Invalid data structure from CAD API');
    }
    
    const result: CADData = {
      usd: data.rates.USD,
      date: data.time_last_update_utc || new Date().toISOString(),
    };
    
    return createSuccessResponse(result);
  } catch (error) {
    logApiError('CAD', error);
    return createErrorResponse(
      'No se pudo obtener la tasa CAD',
      'CAD_FETCH_ERROR'
    );
  }
}
