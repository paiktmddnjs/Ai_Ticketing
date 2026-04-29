import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userStr = params.get('user');

        console.log('Callback params:', { token: token ? 'exists' : 'null', userStr });

        if (token && userStr) {
          // 1. 인증 정보 저장
          localStorage.setItem('auth_token', token);
          
          // userStr이 이미 객체 문자열 형태인지, 아니면 추가 파싱이 필요한지 확인
          // 백엔드에서 어떻게 보내느냐에 따라 다를 수 있으므로 안전하게 처리
          try {
            // 이미 JSON 문자열이면 그대로 저장
            JSON.parse(userStr);
            localStorage.setItem('user', userStr);
          } catch (e) {
            // 만약 순수 문자열이라면 JSON 형태로 감싸서 저장 (Layout에서 parse하므로)
            localStorage.setItem('user', JSON.stringify({ name: userStr, email: '' }));
          }

          // 2. 이동 및 새로고침
          // navigate('/') 대신 window.location.href를 사용하면 확실하게 초기화된 상태로 홈으로 갑니다.
          window.location.href = '/';
        } else {
          const error = params.get('error');
          throw new Error(error || '인증 정보가 누락되었습니다.');
        }
      } catch (error) {
        console.error('구글 로그인 처리 중 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-gray-800">구글 로그인 처리 중...</h2>
      <p className="text-gray-500 mt-2">잠시만 기다려 주세요.</p>
    </div>
  );
};
