import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authService } from '@/lib/services/authService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    // Check for authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let user;
    try {
      user = await authService.verifyToken(token);
    } catch (error) {
      return NextResponse.json({ message: '인증 세션이 만료되었습니다. 다시 로그인해주세요.' }, { status: 401 });
    }

    // Security check: Ensure user is only requesting their own bookings
    if (user.id !== userId) {
      return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        event: true,
        bookingSeats: true,
      },
      orderBy: {
        booked_at: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ message: 'Error fetching bookings' }, { status: 500 });
  }
}
