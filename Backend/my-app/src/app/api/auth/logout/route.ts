import { NextResponse } from 'next/server';
import { withCors, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST() {
  // In a token-based system, logout is often handled client-side by deleting the token.
  // If using cookies, we would clear the cookie here.
  return withCors(NextResponse.json({ message: '로그아웃되었습니다.' }));
}
