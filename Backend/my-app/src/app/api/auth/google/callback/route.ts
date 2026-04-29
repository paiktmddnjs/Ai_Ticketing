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
