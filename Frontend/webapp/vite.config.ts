import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 요청을 보내면,
      '/api': {
        // 백엔드 서버 주소로 대신 보내줍니다. 
        // (백엔드가 Next.js라면 3000, Spring Boot라면 8080 등 맞게 수정하세요)
        target: 'http://localhost:3000', 
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // (필요한 경우에만 주석 해제)
      },
    },
  },
});