import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/eventService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;


  try {
    const event = await eventService.getEventById(id);

    if (!event) {
      return NextResponse.json({ message: '공연 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event details for ID:', id);
    console.error(error);
    return NextResponse.json({ message: '공연 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

