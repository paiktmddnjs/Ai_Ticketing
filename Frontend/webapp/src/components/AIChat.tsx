import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../api/client';

// AI 서버에서 반환받는 예매 정보의 형태
interface BookingIntent {
  eventId: string;
  eventName: string;
  zone: string | null;
  count: number;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 🎫 AI 티켓팅 어시스턴트입니다.\n어떤 공연을 찾으시나요?', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // ⭐️ AI가 예매 의도를 파악했을 때, 예매 확정을 대기하는 상태
  const [pendingBooking, setPendingBooking] = useState<BookingIntent | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // 전역 window 객체에 채팅창 여는 함수 등록
    (window as any).openAIChat = () => setIsOpen(true);
    return () => {
      delete (window as any).openAIChat;
    };
  }, []);

  const openAIChat = () => setIsOpen(true);
  const closeAIChat = () => setIsOpen(false);

  const addMessage = (text: string, isUser = false) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, isUser }]);
  };

  const quickMessage = (msg: string) => {
    setInputValue(msg);
    handleSend(msg);
  };

  // ────────────────────────────────────────────────────────
  // 1. 메시지 전송 로직 (백엔드 AI API 호출)
  // ────────────────────────────────────────────────────────
  const handleSend = async (msgOverride?: string) => {
    const msg = msgOverride || inputValue.trim();
    if (!msg) return;

    if (!msgOverride) setInputValue('');
    addMessage(msg, true);
    setIsTyping(true);
    setPendingBooking(null); // 새 메시지 입력 시 기존 예매 대기 상태 초기화

    try {
      // ✅ 텍스트 분석은 프론트가 아니라 백엔드(/api/chat)에 온전히 맡깁니다.
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      setIsTyping(false);

      // ✅ 서버 응답 유효성 검사 및 기본 메시지 설정
      if (data.type === 'chat') {
        if (data.text && data.text.trim()) {
          addMessage(data.text);
        } else {
          addMessage('죄송합니다. 요청하신 내용을 이해하지 못했습니다. 구체적인 공연명이나 가수를 말씀해 주시면 예매를 도와드릴게요! 🎤');
        }
      } else if (data.type === 'booking_intent') {
        // [경우 B] AI가 예매 의도를 파악하고 JSON으로 데이터를 준 경우
        const intent = data.data as BookingIntent;
        setPendingBooking(intent); // 예매 버튼을 띄우기 위해 상태 저장
        
        const zoneText = intent.zone ? ` (${intent.zone}구역)` : '';
        addMessage(
          `${intent.eventName} ${intent.count}장${zoneText} 예매를 원하시는군요!\n\n이대로 예매를 진행할까요?`
        );
      }
    } catch (error) {
      console.error('AI 통신 오류:', error);
      setIsTyping(false);
      addMessage('서버와 연결하는 중 문제가 발생했습니다.');
    }
  };

  // ────────────────────────────────────────────────────────
  // 2. 예매 확정 로직 (백엔드 예매 API 호출)
  // ────────────────────────────────────────────────────────
  const confirmBooking = async () => {
    if (!pendingBooking) return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      addMessage('예매를 진행하려면 로그인이 필요합니다.', false);
      return;
    }

    addMessage('네, 이대로 진행해 주세요.', true);
    setIsTyping(true);

    try {
      // ✅ 실제 예매 확정 처리 (서버의 DB에 저장)
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_id: pendingBooking.eventId,
          booker_name: JSON.parse(localStorage.getItem('user') || '{}').name || 'AI 예약',
          seats: [], // AI booking currently doesn't select specific seats in this UI, 
                     // but the backend requires seats. This might need more work if AI booking is intended to work.
                     // For now, let's at least fix the auth.
        }),
      });

      const result = await response.json();
      setIsTyping(false);

      if (response.ok) {
        addMessage(`✅ 예매가 성공적으로 완료되었습니다!\n\n상단의 "예매 내역" 메뉴에서 확인하실 수 있습니다.`);
        setPendingBooking(null);
      } else {
        addMessage(`❌ 예매 실패: ${result.message}`);
      }
    } catch (error) {
      setIsTyping(false);
      addMessage('예매 처리 중 서버 오류가 발생했습니다.');
    }
  };

  const cancelBooking = () => {
    addMessage('아니요, 취소할게요.', true);
    setPendingBooking(null);
    setTimeout(() => addMessage('예매가 취소되었습니다. 다른 원하시는 공연이 있나요?'), 500);
  };

  // ────────────────────────────────────────────────────────
  // 3. UI 렌더링
  // ────────────────────────────────────────────────────────
  return (
    <>
      {/* 챗봇 모달 배경 */}
      <div
        id="aiChatModal"
        className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}
        onClick={(e) => e.target === e.currentTarget && closeAIChat()}
      >
        <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl">
          
          {/* 헤더 */}
          <div className="gradient-bg text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <div className="font-bold">AI 티켓팅 어시스턴트</div>
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> 온라인
                </div>
              </div>
            </div>
            <button onClick={closeAIChat} className="text-white/70 hover:text-white transition text-xl">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* 채팅 영역 */}
          <div id="chatMessages" className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.isUser ? 'flex-row-reverse' : ''}`}>
                {!m.isUser && (
                  <div className="w-7 h-7 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-robot text-white text-xs"></i>
                  </div>
                )}
                <div
                  className={`${m.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} p-3 text-sm max-w-xs whitespace-pre-line`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div id="typing-indicator" className="flex gap-2">
                <div className="w-7 h-7 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
                <div className="chat-bubble-ai p-3 text-sm text-gray-400 ai-typing">분석 중...</div>
              </div>
            )}

            {/* ⭐️ 예매 대기 상태일 때만 확정/취소 버튼 표시 */}
            {pendingBooking && !isTyping && (
              <div className="flex gap-2 justify-center mt-2">
                {localStorage.getItem('auth_token') ? (
                  <button onClick={confirmBooking} className="gradient-bg text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition">
                    <i className="fas fa-check mr-1"></i> 예매 확정
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      closeAIChat();
                      window.location.href = '/login';
                    }} 
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-100 transition"
                  >
                    <i className="fas fa-sign-in-alt mr-1"></i> 로그인 후 예매하기
                  </button>
                )}
                <button onClick={cancelBooking} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-50 transition">
                  취소
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 답변 버튼 */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            <button onClick={() => quickMessage('예매 가능한 공연 목록 보여줘')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-indigo-100 transition">공연 목록</button>
            <button onClick={() => quickMessage('아이유 콘서트 R석 2장 예매해줘')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-indigo-100 transition">아이유 R석 2장</button>
            <button onClick={() => quickMessage('임영웅 공연 VIP석 1장 예매해줘')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-indigo-100 transition">임영웅 VIP 1장</button>
          </div>

          {/* 입력창 */}
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input
              id="chatInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text"
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-400"
            />
            <button onClick={() => handleSend()} className="gradient-bg text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition">
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 챗봇 여는 플로팅 버튼 */}
      <button onClick={openAIChat} className="fixed bottom-6 right-6 gradient-bg text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center floating-btn hover:opacity-90 transition z-40">
        <i className="fas fa-robot text-xl"></i>
      </button>
    </>
  );
};
