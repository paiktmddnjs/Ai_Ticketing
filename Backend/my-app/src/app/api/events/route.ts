import { NextResponse } from 'next/server';
import { eventService } from '@/lib/services/eventService';

export async function GET() {
  try {
    const events = await eventService.getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ message: '공연 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
