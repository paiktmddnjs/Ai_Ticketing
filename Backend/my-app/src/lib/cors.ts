import { NextResponse } from 'next/server';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://ai-ticketing.pages.dev',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export function withCors(response: NextResponse) {
  // CORS is now handled globally in middleware.ts
  return response;
}

export function corsOptionsResponse() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
