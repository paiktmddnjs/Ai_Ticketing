import { NextResponse } from 'next/server';

export async function POST() {
  // In a token-based system, logout is often handled client-side by deleting the token.
  // If using cookies, we would clear the cookie here.
  return NextResponse.json({ message: '로그아웃되었습니다.' });
}
