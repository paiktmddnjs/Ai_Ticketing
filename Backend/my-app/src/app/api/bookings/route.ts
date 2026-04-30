import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/bookingService';
import { authService } from '@/lib/services/authService';
import { withCors, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    // Check for authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return withCors(NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }));
    }

    const token = authHeader.split(' ')[1];
    let user;
    try {
      user = await authService.verifyToken(token);
    } catch (error) {
      return withCors(NextResponse.json({ message: '인증 세션이 만료되었습니다. 다시 로그인해주세요.' }, { status: 401 }));
    }

    const data = await request.json();
    
    if (!data.event_id || !data.booker_name || !data.seats || data.seats.length === 0) {
      return withCors(NextResponse.json({ message: '필수 필드가 누락되었습니다.' }, { status: 400 }));
    }

    const result = await bookingService.createBooking({
      ...data,
      user_id: user.id, // Use the verified user ID
      seatIds: data.seats
    });

    return withCors(NextResponse.json(result));
  } catch (error: any) {
    console.error('Booking error:', error);
    return withCors(NextResponse.json({ message: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 }));
  }
}
