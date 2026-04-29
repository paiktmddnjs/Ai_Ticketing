// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { analyzeBookingIntent } from '@/lib/services/chatService'; // 분리한 서비스 불러오기

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 서비스 계층에 메시지를 넘기고 분석된 JSON 결과만 받아옴
    const aiResponse = await analyzeBookingIntent(message);

    // AI 결과에 따라 프론트엔드로 응답 쏴주기
    if (aiResponse.isBookingIntent && aiResponse.eventId) {
      return NextResponse.json({
        type: 'booking_intent',
        data: {
          eventId: aiResponse.eventId,
          eventName: aiResponse.eventName,
          zone: aiResponse.zone,
          count: aiResponse.count,
        }
      });
    } else {
      return NextResponse.json({
        type: 'chat',
        text: aiResponse.text
      });
    }
    
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { type: 'chat', text: '죄송합니다. 서버와 연결하는 중 문제가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}