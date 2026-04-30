import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'https://ai-ticketing.pages.dev',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
}

export function proxy(request: NextRequest) {
  // OPTIONS preflight → 즉시 200 반환 (DB/Prisma 오류와 무관)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: CORS_HEADERS,
    })
  }

  // 일반 요청 → 다음 핸들러로 통과 + CORS 헤더 추가
  const response = NextResponse.next()
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export const config = {
  matcher: '/api/:path*',
}