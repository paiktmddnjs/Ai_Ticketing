import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/eventService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  try {
    const events = await eventService.searchEvents(query || '');
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    return NextResponse.json({ message: '공연 검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
