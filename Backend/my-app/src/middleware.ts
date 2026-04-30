import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin');
  
  // Create a response
  const response = NextResponse.next();

  // Allow the specific origin
  if (origin === 'https://ai-ticketing.pages.dev') {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for production
    response.headers.set('Access-Control-Allow-Origin', 'https://ai-ticketing.pages.dev');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};