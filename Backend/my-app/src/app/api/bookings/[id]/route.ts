import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/bookingService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;


  try {
    const booking = await bookingService.getBooking(id);

    if (!booking) {
      return NextResponse.json({ message: '예매 내역을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ message: '예매 내역을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
