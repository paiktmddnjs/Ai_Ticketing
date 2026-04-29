import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json();
    const result = await authService.login(credentials);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 401 });
  }
}
