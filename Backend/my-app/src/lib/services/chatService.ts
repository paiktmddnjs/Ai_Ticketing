// src/services/chatService.ts (또는 프로젝트 구조에 맞게 services/chatService.ts)
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 1. DB 조회 및 프롬프트용 문자열 생성 함수 (내부에서만 사용)
async function getActiveEventsString() {
  const activeEvents = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
    },
    // where: { status: 'ONGOING' }
  });

  return activeEvents
    .map(event => `- ${event.id}: ${event.title}`)
    .join('\n');
}

// 2. 외부(Controller)에서 호출할 핵심 AI 분석 함수
export async function analyzeBookingIntent(message: string) {
  // DB에서 최신 공연 목록 가져오기
  const eventListString = await getActiveEventsString();

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
       responseMimeType: "application/json",
    }
  });

  const prompt = `
    너는 친절하고 정확한 티켓 예매 어시스턴트야.
    현재 예매 가능한 공연은 다음과 같아:
    ${eventListString}

    사용자의 메시지를 분석해서 반드시 아래 JSON 형식으로만 응답해:
    {
      "isBookingIntent": boolean (사용자가 특정 공연 예매를 원하면 true, 단순 대화면 false),
      "text": "string (단순 대화일 경우의 친절한 답변, 예매 의도가 있으면 빈 문자열)",
      "eventId": "string (예매 시 공연 ID, 모르면 null)",
      "eventName": "string (예매 시 공연 이름, 모르면 null)",
      "zone": "string (VIP, R, S, A 중 하나. 언급 없으면 null)",
      "count": number (예매 매수, 언급 없으면 1)
    }

    사용자 메시지: "${message}"
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}