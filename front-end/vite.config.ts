import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 예: API 요청을 백엔드로 프록시
      "/api": {
        target: "https://moaloa.store", // 백엔드 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // 경로 재작성
      },
    },
  },
  build: {
    sourcemap: false, // 소스 맵 비활성화
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
