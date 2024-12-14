import React, { useEffect, useRef } from "react";

interface TurnstileProps {
  siteKey: string; // Cloudflare에서 발급받은 Site Key
  onVerify: (token: string) => void; // 검증 성공 시 실행할 콜백 함수
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileRenderOptions) => void;
    };
  }
}

interface TurnstileRenderOptions {
  sitekey: string; // Turnstile에서 발급받은 Site Key
  callback: (token: string) => void; // 성공 시 실행할 콜백 함수
  theme?: "light" | "dark"; // Turnstile 테마 설정
}

const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onVerify }) => {
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage에서 테마 값 가져오기
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    // 브라우저의 테마 설정 감지
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme || (prefersDarkScheme ? "dark" : "light");

    // Turnstile 위젯 초기화
    if (window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token); // 검증 성공 시 콜백 실행
        },
        theme: theme, // 위젯 테마 설정
      });
    }
  }, [siteKey, onVerify]);

  return <div className="cf-turnstile" ref={turnstileRef}></div>; // 위젯이 렌더링될 div
};

export default Turnstile;
