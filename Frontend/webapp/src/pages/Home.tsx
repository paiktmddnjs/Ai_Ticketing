import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../api/services/eventService';
import { Event as ApiEvent } from '../api/types';

export const Home = () => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (!searchInput) return;

    const handleInput = (e: Event) => {
      setSearchQuery((e.target as HTMLInputElement).value);
    };

    searchInput.addEventListener('input', handleInput);
    return () => searchInput.removeEventListener('input', handleInput);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // In a real app, you might pass category/query to the API
      const data = await eventService.getAllEvents();
      
      let filtered = data;
      if (currentCategory !== 'all') {
        filtered = filtered.filter(e => e.category === currentCategory);
      }
      if (searchQuery) {
        filtered = filtered.filter(e =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setEvents(filtered);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentCategory, searchQuery]);

  const categoryEmoji: Record<string, string> = { concert: '🎤', musical: '🎭', sports: '⚾', theater: '🎬' };
  const categoryLabel: Record<string, string> = { concert: '콘서트', musical: '뮤지컬', sports: '스포츠', theater: '연극' };
  const bgColors: Record<string, string> = {
    concert: 'from-purple-500 to-indigo-600',
    musical: 'from-rose-500 to-pink-600',
    sports: 'from-emerald-500 to-teal-600',
    theater: 'from-amber-500 to-orange-600'
  };

  return (
    <>
      {/* 히어로 배너 */}
      <section className="gradient-bg text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <i className="fas fa-robot"></i>
            <span>AI가 최적의 좌석을 자동으로 예매해드립니다</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">스마트한 티켓 예매<br />AI티켓과 함께</h1>
          <p className="text-white/80 text-lg mb-8">원하는 공연과 좌석을 말씀만 하세요.<br />AI가 최적의 자리를 찾아 자동 예매해드립니다.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => (window as any).openAIChat && (window as any).openAIChat()}
              className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-robot"></i> AI 자동 예매 시작
            </button>
            <button
              onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition"
            >
              공연 둘러보기
            </button>
          </div>
        </div>
      </section>

      {/* 카테고리 필터 */}
      <section className="max-w-7xl mx-auto px-4 py-6" id="events-section">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'concert', 'musical', 'sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border-2 ${currentCategory === cat
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
            >
              {cat === 'all' ? '🎭 전체' : `${categoryEmoji[cat]} ${categoryLabel[cat]}`}
            </button>
          ))}
        </div>
      </section>

      {/* 공연 목록 */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-4"></i>
            <p>공연 목록 불러오는 중...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-search text-5xl mb-4 opacity-20"></i>
            <p className="text-lg">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div id="eventsGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => {
              const availableRatio = e.available_seats / e.total_seats;
              const urgency = availableRatio < 0.2 ? 'text-red-500' : availableRatio < 0.5 ? 'text-amber-500' : 'text-green-500';

              return (
                <article key={e.id} className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover border border-gray-100">
                  <div className={`h-40 bg-gradient-to-br ${bgColors[e.category] || bgColors.concert} flex flex-col items-center justify-center text-white relative p-4`}>
                    <div className="text-5xl mb-2">{categoryEmoji[e.category]}</div>
                    <div className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">{categoryLabel[e.category]}</div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {e.event_date}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{e.title}</h2>
                    <p className="text-xs text-indigo-600 font-medium mb-2">{e.artist}</p>
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5"><i className="fas fa-clock text-indigo-400"></i>{e.event_time}</div>
                      <div className="flex items-center gap-1.5"><i className="fas fa-map-marker-alt text-indigo-400"></i>{e.venue}</div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-gray-400">최저가</span>
                        <span className="text-indigo-600 font-bold text-sm ml-1">{e.prices.A.toLocaleString()}원~</span>
                      </div>
                      <span className={`text-xs ${urgency} font-medium`}>
                        잔여 {e.available_seats}석
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/event/${e.id}`} className="flex-1 text-center gradient-bg text-white text-sm py-2 rounded-xl font-medium hover:opacity-90 transition">
                        좌석 선택
                      </Link>
                      <button
                        onClick={() => {
                          (window as any).openAIChat?.();
                          setTimeout(() => {
                            const chatInput = document.getElementById('chatInput') as HTMLInputElement;
                            if (chatInput) {
                              chatInput.value = `${e.artist} 공연 R석 2장 예매해줘`;
                              // Trigger send somehow or just let user click
                            }
                          }, 500);
                        }}
                        className="px-3 py-2 border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm"
                      >
                        <i className="fas fa-robot"></i>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};
