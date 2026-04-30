import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 💡 함수 이름이 proxy로 변경되었습니다!
export function proxy(request: NextRequest) {
  const allowedOrigin = 'https://ai-ticketing.pages.dev'
  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}