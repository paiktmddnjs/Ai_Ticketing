import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { withCors, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET(request: NextRequest) {

  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return withCors(NextResponse.json({ message: '인증되지 않은 요청입니다.' }, { status: 401 }));
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await authService.verifyToken(token);
    return withCors(NextResponse.json(user));
  } catch (error: any) {
    console.error('Auth check error:', error);
    return withCors(NextResponse.json({ message: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 401 }));
  }
}
