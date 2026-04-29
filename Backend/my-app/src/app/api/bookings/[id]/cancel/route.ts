import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/bookingService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await bookingService.cancelBooking(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ message: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
