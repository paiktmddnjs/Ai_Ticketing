import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../api/types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 좌측: 로고 및 검색창 */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
                <i className="fas fa-ticket-alt text-white text-sm"></i>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI티켓</span>
            </Link>
            <div className="relative hidden md:block">
              <input 
                id="searchInput" 
                type="text" 
                placeholder="공연, 아티스트 검색..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-400 w-64" 
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
            </div>
          </div>

          {/* 우측: 버튼 및 인증네비 */}
          <div className="flex items-center gap-4">
            <Link to="/bookings" className="text-gray-600 hover:text-indigo-600 transition text-sm font-medium">
              <i className="fas fa-list-alt mr-1"></i>예매 내역
            </Link>

            <div className="w-px h-4 bg-gray-300 mx-2 hidden sm:block"></div>

            {/* 인증 상태 */}
            <div id="authNav" className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm font-bold text-gray-800">{user.name}님</span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500 font-medium transition"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition">로그인</Link>
                  <Link to="/signup" className="gradient-bg text-white px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition">회원가입</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};
