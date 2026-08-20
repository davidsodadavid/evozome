"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; theme?: "light" | "dark" | "auto" }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Cloudflare Turnstile bot-check widget. Renders nothing if no site key is
 * configured. Pass `resetKey` (e.g. the useActionState `state` object) so
 * the widget re-issues a fresh challenge after a failed submission — a
 * Turnstile token is single-use and goes stale otherwise. */
export default function TurnstileWidget({ resetKey }: { resetKey?: unknown }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;

    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY as string,
        theme: "dark",
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          renderWidget();
        }
      }, 100);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    // Intentionally only depends on resetKey (e.g. a new failed-submission
    // state) — re-fires when the caller wants a fresh challenge, not on
    // every render.
  }, [resetKey]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div ref={containerRef} />
    </>
  );
}
