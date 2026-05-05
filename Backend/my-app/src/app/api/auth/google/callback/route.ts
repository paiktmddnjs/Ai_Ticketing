import { authService } from '@/lib/services/authService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const result = await authService.loginWithGoogle(token);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error === 'access_denied' || error) {
    // 날것의 JSON을 보여주지 않고, 로그인 페이지로 다시 돌려보냅니다.
    // 쿼리 파라미터로 에러 상태를 넘겨서, 프론트 단에서 "로그인이 취소되었습니다" 같은 알림을 띄우게 할 수도 있습니다.
    return NextResponse.redirect(new URL('/login?message=cancelled', request.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  try {
    // For redirect flow, we exchange code for tokens
    // We can reuse the same authService but might need a slightly different method if we want to handle 'code'
    // Alternatively, the frontend handles the redirect and sends the code/token.
    // Given the frontend code provided, it seems to expect calling this route with a token.
    
    // If we're here from a redirect, we might want to redirect back to the frontend with the token
    const result = await authService.loginWithGoogleCode(code);
    
    // Redirect back to frontend with token in URL or cookie
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userStr = encodeURIComponent(JSON.stringify(result.user));
    return NextResponse.redirect(`${frontendUrl}/auth/callback?token=${result.token}&user=${userStr}`);
  } catch (error: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return NextResponse.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
}
