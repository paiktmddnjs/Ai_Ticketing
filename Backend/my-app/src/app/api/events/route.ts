import { NextResponse } from 'next/server';
import { eventService } from '@/lib/services/eventService';
import { withCors, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET() {
  try {
    const events = await eventService.getAllEvents();
    return withCors(NextResponse.json(events));
  } catch (error) {
    console.error('Error fetching events:', error);
    return withCors(NextResponse.json({ message: '공연 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 }));
  }
}
