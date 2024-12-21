import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  theme?: "light" | "dark";
}

const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onVerify }) => {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [shouldRender, setShouldRender] = useState<boolean>(true);

  useEffect(() => {
    // 쿠키 확인
    const clearanceToken = Cookies.get("cf_clearance");
    if (clearanceToken) {
      setShouldRender(false);
      return;
    }

    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme || (prefersDarkScheme ? "dark" : "light");

    if (window.turnstile && turnstileRef.current && shouldRender) {
      const id = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
          setTimeout(() => {
            setShouldRender(false);
          }, 2000);
        },
        theme: theme,
      });
      widgetIdRef.current = id;
    }

    // // 컴포넌트 언마운트 시 위젯 리셋
    // return () => {
    //   if (window.turnstile && widgetIdRef.current) {
    //     window.turnstile.reset(widgetIdRef.current);
    //   }
    // };
  }, [siteKey, onVerify, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return <div className="cf-turnstile" ref={turnstileRef} />;
};

export default Turnstile;
