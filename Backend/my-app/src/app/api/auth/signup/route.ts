import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await authService.signup(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 400 });
  }
}
