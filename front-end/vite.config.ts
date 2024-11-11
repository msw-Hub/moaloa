import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    proxy: {
      "/api": {
        // 예시로 '/api' 경로가 포함된 요청을 프록시
        target: "http://localhost:8080", // Spring 서버 주소
        changeOrigin: true,
        secure: false, // https 사용 시 false 설정
      },
    },
  },
});
