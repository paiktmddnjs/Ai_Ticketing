// CORS is now handled in next.config.ts. 
// If you need more complex middleware logic in the future, you can add it here.

/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. 응답 객체를 생성합니다.
  const response = NextResponse.next();

  // 2. 허용할 프론트엔드 주소를 정확히 입력합니다. (마지막에 /가 붙지 않도록 주의!)
  const origin = 'https://ai-ticketing.pages.dev';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // 3. 사전 검사(Preflight) 요청인 OPTIONS 메서드 처리
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

// 4. 이 미들웨어가 적용될 경로를 설정합니다. (모든 API 경로)
export const config = {
  matcher: '/api/:path*',
};
*/

export function middleware() {}