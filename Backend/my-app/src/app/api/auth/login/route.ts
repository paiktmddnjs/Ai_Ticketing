import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { withCors, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json();
    const result = await authService.login(credentials);
    return withCors(NextResponse.json(result));
  } catch (error: any) {
    console.error('Login error:', error);
    return withCors(NextResponse.json({ message: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 401 }));
  }
}
