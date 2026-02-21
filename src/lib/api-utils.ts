import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  code: string;
  timestamp: string;
}

export interface FetchOptions {
  timeout?: number;
  revalidate?: number;
}

const DEFAULT_TIMEOUT = 10000;

export async function fetchWithTimeout(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, revalidate } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: revalidate ? { revalidate } : undefined,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createErrorResponse(
  message: string, 
  code: string, 
  status: number = 500
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createSuccessResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data);
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function logApiError(endpoint: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const isTimeout = error instanceof Error && error.name === 'AbortError';
  
  console.error(`[API ${endpoint}] ${isTimeout ? 'Timeout' : 'Error'}:`, errorMessage);
}
