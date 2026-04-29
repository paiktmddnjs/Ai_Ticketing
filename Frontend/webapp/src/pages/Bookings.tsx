import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../api/services/bookingService';
import { User, EventData } from '../api/types';
import CalendarButton from '../components/CalendarButton';

interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  bookerName: string;
  bookedAt: string;
  seats: {
    zone: string;
    row: string;
    number: number;
  }[];
  totalPrice: number;
}

export const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setLoading(false);
      return;
    }
    const currentUser = JSON.parse(savedUser);
    setUser(currentUser);

    const fetchBookings = async () => {
      try {
        const data = await bookingService.getUserBookings(currentUser.id);
        // Map backend API response to frontend Booking interface
        const mappedBookings: Booking[] = (data as any[]).map(b => {
          const rawDate = b.event?.event_date || '';
          const rawTime = b.event?.event_time || '';
          
          // ISO 포맷인 경우 날짜(YYYY-MM-DD)와 시간(HH:mm)만 추출
          const formattedDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
          const formattedTime = rawTime.includes('T') ? rawTime.split('T')[1].substring(0, 5) : rawTime;

          return {
            id: b.id,
            eventId: b.event_id,
            eventTitle: b.event?.title || '정보 없음',
            eventDate: formattedDate,
            eventTime: formattedTime,
            venue: b.event?.venue || '',
            bookerName: b.booker_name,
            bookedAt: b.booked_at,
            seats: b.bookingSeats?.map((s: any) => ({
              zone: s.zone,
              row: s.seat_row,
              number: s.seat_number
            })) || [],
            totalPrice: b.total_price
          };
        });
        setBookings(mappedBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <i className="fas fa-spinner fa-spin text-3xl text-indigo-500"></i>
        <p className="mt-2 text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <i className="fas fa-lock text-5xl text-gray-200 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 mb-6">예매 내역을 확인하시려면 로그인을 해주세요.</p>
          <Link to="/login" className="gradient-bg text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition inline-block">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <i className="fas fa-list-alt text-indigo-500"></i> 예매 내역
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fas fa-ticket-alt text-5xl mb-4 opacity-30"></i>
          <p className="text-lg font-medium">예매 내역이 없습니다</p>
          <p className="text-sm mt-1 mb-6">공연을 예매해보세요!</p>
          <Link to="/" className="gradient-bg text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition inline-block">
            공연 둘러보기
          </Link>
        </div>
      ) : (
        <div id="bookingsList">
          {bookings.map(b => {
            const date = new Date(b.bookedAt);
            const bookedDate = date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

            return (
              <article key={b.id} className="ticket-bg rounded-2xl border-2 border-indigo-100 overflow-hidden mb-4 shadow-sm">
                <div className="gradient-bg text-white px-5 py-3 flex items-center justify-between">
                  <div className="font-bold text-sm">{b.eventTitle}</div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-400 text-white text-xs px-2.5 py-1 rounded-full font-bold">예매 완료</div>
                    {(() => {
                      try {
                        const digits = b.eventDate.replace(/\D/g, ''); 
                        let dateStr = digits.length >= 8 ? `${digits.substring(0, 4)}-${digits.substring(4, 6)}-${digits.substring(6, 8)}` : b.eventDate.replace(/\./g, '-').trim();
                        const timeStr = (b.eventTime || '00:00').replace(/[^0-9:]/g, '');
                        const startDate = new Date(`${dateStr}T${timeStr}`);
                        const finalDate = isNaN(startDate.getTime()) ? new Date(b.bookedAt) : startDate;

                        return (
                          <CalendarButton 
                            eventData={{
                              title: b.eventTitle,
                              description: `${b.bookerName}님의 예매 내역 (예매번호: ${b.id})`,
                              location: b.venue,
                              startDate: finalDate,
                              durationMinutes: 120
                            }}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/30"
                          >
                            <i className="fas fa-calendar-plus text-xs"></i>
                          </CalendarButton>
                        );
                      } catch (e) { return null; }
                    })()}
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">공연 일시</div>
                      <div className="font-medium text-gray-700">{b.eventDate} {b.eventTime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">공연 장소</div>
                      <div className="font-medium text-gray-700 text-xs">{b.venue}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">예매자</div>
                      <div className="font-medium text-gray-700">{b.bookerName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">예매 일시</div>
                      <div className="font-medium text-gray-700 text-xs">{bookedDate}</div>
                    </div>
                  </div>

                  {expandedIds.includes(b.id) && (
                    <div className="bg-white rounded-xl p-3 mb-3 border border-indigo-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="text-xs text-gray-400 mb-2 font-medium">선택 좌석</div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {b.seats.map((s, idx) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {s.zone}구역 {s.row}열 {s.number}번
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-gray-50">
                        <div className="text-xs text-gray-400">예매번호</div>
                        <div className="font-mono font-bold text-indigo-600 text-sm">{b.id}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => toggleExpand(b.id)}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      {expandedIds.includes(b.id) ? (
                        <><i className="fas fa-chevron-up"></i> 접기</>
                      ) : (
                        <><i className="fas fa-chevron-down"></i> 자세히 보기</>
                      )}
                    </button>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">결제 금액</div>
                      <div className="text-xl font-black text-indigo-600">{b.totalPrice.toLocaleString()}원</div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
