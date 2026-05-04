import { NextResponse } from 'next/server';

const DEFAULT_ALLOWED_ORIGIN = 'https://ai-ticketing.pages.dev';

const ALLOWED_ORIGINS = new Set([
  DEFAULT_ALLOWED_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
]);

function getAllowedOrigin(request?: Request) {
  const origin = request?.headers.get('origin');
  return origin && ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ALLOWED_ORIGIN;
}

export function getCorsHeaders(request?: Request) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(request),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': DEFAULT_ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export function withCors(response: NextResponse, request?: Request) {
  Object.entries(getCorsHeaders(request)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function corsOptionsResponse(request?: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
