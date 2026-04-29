import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/eventService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;


  try {
    const seats = await eventService.getSeatsByEventId(id);
    return NextResponse.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    return NextResponse.json({ message: '좌석 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
