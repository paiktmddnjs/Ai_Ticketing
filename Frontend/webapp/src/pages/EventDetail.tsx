import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../api/services/eventService';
import { bookingService } from '../api/services/bookingService';
import { mapEventToCalendarData } from '../api/services/utils';
import { Event as ApiEvent, Seat } from '../api/types';
import CalendarButton from '../components/CalendarButton';

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookerName, setBookerName] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [aiZone, setAiZone] = useState('');
  const [aiCount, setAiCount] = useState('1');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setBookerName(user.name || '');
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const foundEvent = await eventService.getEventById(id);
        if (!foundEvent) {
          navigate('/');
          return;
        }
        setEvent(foundEvent);
        const fetchedSeats = await eventService.getSeatsByEventId(id);
        setSeats(fetchedSeats);
      } catch (error) {
        console.error('Failed to fetch event detail:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);


  const toggleSeat = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'booked') return;

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seatId);
      if (isSelected) {
        return prev.filter(s => s.id !== seatId);
      } else {
        if (prev.length >= 8) {
          alert('최대 8석까지 선택 가능합니다.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const aiAutoSelect = () => {
    const count = parseInt(aiCount);
    const available = seats.filter(s => s.status === 'available' && (!aiZone || s.zone === aiZone));

    if (available.length < count) {
      alert((aiZone ? aiZone + '구역에 ' : '') + '잔여 좌석이 ' + available.length + '석밖에 없습니다.');
      return;
    }

    const byRow: Record<string, Seat[]> = {};
    available.forEach(s => {
      const key = s.zone + '-' + s.seat_row;
      if (!byRow[key]) byRow[key] = [];
      byRow[key].push(s);
    });

    let selected: Seat[] | null = null;
    for (const key of Object.keys(byRow)) {
      const rowSeats = byRow[key].sort((a, b) => a.seat_number - b.seat_number);
      for (let i = 0; i <= rowSeats.length - count; i++) {
        const chunk = rowSeats.slice(i, i + count);
        const isConsec = chunk.every((s, idx) => idx === 0 || s.seat_number === chunk[idx - 1].seat_number + 1);
        if (isConsec) { selected = chunk; break; }
      }
      if (selected) break;
    }

    if (!selected) selected = available.slice(0, count);

    setSelectedSeats(selected);
    const info = selected.map(s => `${s.zone}구역 ${s.seat_row}열 ${s.seat_number}번`).join(', ');
    alert('✨ AI가 최적 좌석을 선택했습니다!\n\n' + info);

  };

  const handleBook = async () => {
    if (!bookerName.trim()) { alert('예매자 이름을 입력해주세요.'); return; }
    if (selectedSeats.length === 0) { alert('좌석을 선택해주세요.'); return; }

    setIsBooking(true);
    try {
      const savedUser = localStorage.getItem('user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      const bookingData = await bookingService.createBooking({
        event_id: id!,
        booker_name: bookerName,
        seats: selectedSeats.map(s => s.id),
        user_id: currentUser?.id // Pass user_id if logged in
      } as any);

      setBookingResult(bookingData);
      setShowSuccess(true);
      
      // Update local seats status
      setSeats(prev => prev.map(s =>
        selectedSeats.find(sel => sel.id === s.id) ? { ...s, status: 'booked' } : s
      ));
      setSelectedSeats([]);
    } catch (error) {
      alert('예매 요청 중 오류가 발생했습니다.');
    } finally {
      setIsBooking(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <i className="fas fa-spinner fa-spin text-3xl text-indigo-500"></i>
        <p className="mt-2 text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  if (!event) return null;

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const zoneColors = { VIP: 'text-amber-600', R: 'text-blue-600', S: 'text-green-600', A: 'text-gray-600' };
  const bgColors: Record<string, string> = { concert: 'from-purple-500 to-indigo-600', musical: 'from-rose-500 to-pink-600', sports: 'from-emerald-500 to-teal-600' };
  const categoryIcons: Record<string, string> = { concert: '🎤', musical: '🎭', sports: '⚾', theater: '🎬' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 공연 정보 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className={`w-24 h-24 bg-gradient-to-br ${bgColors[event.category] || bgColors.concert} rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 text-white`}>
            {categoryIcons[event.category] || '🎟️'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-800 mb-1">{event.title}</h1>
            <p className="text-indigo-600 font-medium text-sm mb-2">{event.artist}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><i className="fas fa-calendar text-indigo-400"></i>{event.event_date}</div>
              <div className="flex items-center gap-1.5"><i className="fas fa-clock text-indigo-400"></i>{event.event_time}</div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1"><i className="fas fa-map-marker-alt text-indigo-400"></i>{event.venue}</div>
            </div>

          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">가격 안내</div>
            <div className="space-y-0.5 text-xs">
              <div><span className="text-amber-500 font-bold">VIP</span> {event.prices.VIP.toLocaleString()}원</div>
              <div><span className="text-blue-500 font-bold">R석</span> {event.prices.R.toLocaleString()}원</div>
              <div><span className="text-green-500 font-bold">S석</span> {event.prices.S.toLocaleString()}원</div>
              <div><span className="text-gray-500 font-bold">A석</span> {event.prices.A.toLocaleString()}원</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌석 배치도 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <i className="fas fa-chair text-indigo-500"></i> 좌석 선택
            </h2>

            {/* 무대 */}
            <div className="gradient-bg text-white text-center py-3 rounded-xl text-sm font-bold mb-6 tracking-widest">
              ★ STAGE ★
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-amber-100 border-2 border-amber-400"></div><span>VIP</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-blue-100 border-2 border-blue-400"></div><span>R석</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-green-100 border-2 border-green-400"></div><span>S석</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-400"></div><span>A석</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-gray-200 border-2 border-gray-300 opacity-50"></div><span>예매 완료</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: '2px solid #4f46e5' }}></div><span>선택됨</span></div>
            </div>

            {/* 좌석 배치 */}
            <div id="seatMap" className="overflow-x-auto">
              <div className="space-y-6">
                {(['VIP', 'R', 'S', 'A'] as const).map(zone => {
                  const zoneSeats = seats.filter(s => s.zone === zone);
                  if (zoneSeats.length === 0) return null;
                  const rows = Array.from(new Set(zoneSeats.map(s => s.seat_row))).sort();
                  const price = event.prices[zone as keyof typeof event.prices];

                  return (
                    <div key={zone}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-bold ${zoneColors[zone as keyof typeof zoneColors]} text-sm`}>{zone}구역</span>
                        <span className="text-xs text-gray-400">{price.toLocaleString()}원/석</span>
                        <span className="text-xs text-gray-400">({zoneSeats.filter(s => s.status === 'available').length}석 남음)</span>
                      </div>
                      <div className="space-y-1.5">
                        {rows.map(row => (
                          <div key={row} className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400 w-5 text-center font-mono">{row}</span>
                            <div className="flex gap-1 flex-wrap">
                              {zoneSeats.filter(s => s.seat_row === row).sort((a, b) => a.seat_number - b.seat_number).map(seat => {
                                const isBooked = seat.status === 'booked';
                                const isSelected = selectedSeats.find(s => s.id === seat.id);
                                const cls = isSelected ? 'seat seat-selected' : isBooked ? 'seat seat-booked' : `seat seat-available-${zone}`;
                                return (
                                  <div
                                    key={seat.id}
                                    className={cls}
                                    onClick={() => !isBooked && toggleSeat(seat.id)}
                                    title={`${zone}${row}열 ${seat.seat_number}번 ${price.toLocaleString()}원`}
                                  >
                                    {seat.seat_number}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 예매 패널 */}
        <div className="space-y-4">
          {/* AI 자동 선택 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
            <h3 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
              <i className="fas fa-robot"></i> AI 자동 선택
            </h3>
            <div className="space-y-2 mb-3">
              <select
                value={aiZone}
                onChange={(e) => setAiZone(e.target.value)}
                className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option value="">구역 선택 (전체)</option>
                <option value="VIP">VIP구역</option>
                <option value="R">R구역</option>
                <option value="S">S구역</option>
                <option value="A">A구역</option>
              </select>
              <select
                value={aiCount}
                onChange={(e) => setAiCount(e.target.value)}
                className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option value="1">1장</option>
                <option value="2">2장</option>
                <option value="3">3장</option>
                <option value="4">4장</option>
              </select>
            </div>
            <button onClick={aiAutoSelect} className="w-full gradient-bg text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 mb-2">
              <i className="fas fa-magic"></i> AI 최적 좌석 선택
            </button>
            <button 
              onClick={() => {
                (window as any).openAIChat?.();
                setTimeout(() => {
                  const chatInput = document.getElementById('chatInput') as HTMLInputElement;
                  if (chatInput) {
                    chatInput.value = `${event.title} 명당 자리 추천해줘`;
                  }
                }, 500);
              }}
              className="w-full bg-white text-indigo-600 border-2 border-indigo-100 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-comment-dots"></i> AI 어시스턴트에게 상담하기
            </button>

          </div>

          {/* 선택한 좌석 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-list-check text-indigo-500"></i> 선택한 좌석
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{selectedSeats.length}석</span>
            </h3>
            {selectedSeats.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-3">선택한 좌석이 없습니다</div>
            ) : (
              <div className="space-y-2">
                {selectedSeats.map(s => (
                  <div key={s.id} className="flex justify-between items-center py-1 border-b border-gray-50 text-sm">
                    <span>{s.zone}구역 {s.seat_row}열 {s.seat_number}번</span>
                    <div className="flex items-center gap-2">

                      <span className="text-indigo-600 font-medium">{s.price.toLocaleString()}원</span>
                      <button onClick={() => toggleSeat(s.id)} className="text-red-400 hover:text-red-600 text-xs"><i className="fas fa-times"></i></button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>합계</span>
                    <span className="text-indigo-600">{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 예매자 정보 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-user text-indigo-500"></i> 예매자 정보
            </h3>
            {currentUser ? (
              <>
                <input
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  type="text"
                  placeholder="이름 입력"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 mb-2"
                />
                <button
                  onClick={handleBook}
                  disabled={selectedSeats.length === 0 || isBooking}
                  className={`w-full gradient-bg text-white py-3 rounded-xl text-sm font-bold transition ${selectedSeats.length === 0 || isBooking ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                >
                  <i className="fas fa-ticket-alt mr-1"></i> {isBooking ? '처리 중...' : '예매하기'}
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 mb-3">로그인 후 예매가 가능합니다.</p>
                <Link
                  to="/login"
                  state={{ from: `/events/${id}` }}
                  className="block w-full bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition"
                >
                  로그인하러 가기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 예매 완료 모달 */}
      {showSuccess && bookingResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">예매 완료!</h2>
            <div className="text-gray-600 text-sm mb-6 text-left bg-gray-50 rounded-xl p-4">
              <div className="space-y-1">
                <div><span className="font-medium">공연:</span> {event.title}</div>
                <div><span className="font-medium">일시:</span> {event.event_date} {event.event_time}</div>
                <div><span className="font-medium">장소:</span> {event.venue}</div>
                <div><span className="font-medium">좌석:</span> {(bookingResult.bookingSeats || bookingResult.seats)?.map((s: any) => `${s.zone}구역 ${s.seat_row || s.row}열 ${s.seat_number || s.number}번`).join(', ') || '정보 없음'}</div>
                <div><span className="font-medium">금액:</span> {bookingResult.total_price?.toLocaleString()}원</div>
                <div><span className="font-medium">예매번호:</span> <span className="text-indigo-600 font-mono font-bold">{bookingResult.id}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/bookings" className="flex-1 gradient-bg text-white py-3 rounded-xl font-bold text-sm text-center hover:opacity-90 transition">
                예매 내역 확인
              </Link>
               {/* 여기에 캘린더 버튼 추가 */} 
             <CalendarButton eventData={mapEventToCalendarData(event)} /> 
              <button onClick={() => setShowSuccess(false)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm text-center hover:bg-gray-50 transition">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
