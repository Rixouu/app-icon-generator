'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_INSTALLED = 'app-icon-gen-pwa-installed';
const STORAGE_SNOOZE_UNTIL = 'app-icon-gen-pwa-snooze-until';
const IOS_FALLBACK_MS = 1800;
const SNOOZE_MS = 21 * 24 * 60 * 60 * 1000;

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iphone|ipod|ipad/i.test(ua)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return false;
}

type IosBrowserFlavor = 'safari' | 'chrome' | 'firefox' | 'other';

function iosBrowserFlavor(): IosBrowserFlavor {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/CriOS\//i.test(ua) || /EdgiOS\//i.test(ua) || /OPiOS\//i.test(ua)) return 'chrome';
  if (/FxiOS\//i.test(ua)) return 'firefox';
  if (/Safari/i.test(ua) && /Mobile\//i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//i.test(ua)) {
    return 'safari';
  }
  return 'other';
}

function iosInstructions(flavor: IosBrowserFlavor): string {
  switch (flavor) {
    case 'safari':
      return 'Tap Share, then “Add to Home Screen”.';
    case 'chrome':
      return 'Tap the menu (⋯), then “Add to Home Screen” or open in Safari and use Share.';
    case 'firefox':
      return 'Tap the menu, then “Share”, then “Add to Home Screen”.';
    default:
      return 'Use Safari or your browser’s menu to “Add to Home Screen”.';
  }
}

function readInstalledFlag(): boolean {
  try {
    return localStorage.getItem(STORAGE_INSTALLED) === '1';
  } catch {
    return false;
  }
}

function readSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_SNOOZE_UNTIL);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function writeSnooze(): void {
  try {
    localStorage.setItem(STORAGE_SNOOZE_UNTIL, String(Date.now() + SNOOZE_MS));
  } catch {
    /* ignore */
  }
}

function writeInstalled(): void {
  try {
    localStorage.setItem(STORAGE_INSTALLED, '1');
  } catch {
    /* ignore */
  }
}

/**
 * Chrome install prompt + iOS “Add to Home Screen” hint (same pattern as Split The G).
 */
export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [iosFlavor, setIosFlavor] = useState<IosBrowserFlavor>('other');
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    deferredRef.current = deferred;
  }, [deferred]);

  useEffect(() => {
    if (iosHint && typeof navigator !== 'undefined') {
      setIosFlavor(iosBrowserFlavor());
    }
  }, [iosHint]);

  const dismiss = useCallback(() => {
    writeSnooze();
    setDeferred(null);
    setIosHint(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandaloneDisplay()) return;
    if (readInstalledFlag()) return;
    if (readSnoozed()) return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setIosHint(false);
    };

    const onAppInstalled = () => {
      writeInstalled();
      setDeferred(null);
      setIosHint(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    const timer = window.setTimeout(() => {
      if (deferredRef.current) return;
      if (isStandaloneDisplay()) return;
      if (readInstalledFlag() || readSnoozed()) return;
      if (isIosDevice()) setIosHint(true);
    }, IOS_FALLBACK_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const showChrome = deferred != null;
  const showIos = iosHint && !showChrome;
  const visible = showChrome || showIos;

  const onInstallClick = async () => {
    if (!deferred || installing) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  };

  if (!visible) return null;

  const shellClass =
    'fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px)+var(--mobile-nav-offset))] left-4 right-4 z-[100] sm:left-1/2 sm:right-auto sm:w-[min(560px,calc(100vw-2rem))] sm:-translate-x-1/2';
  const panelClass =
    'flex items-center justify-between gap-4 rounded-[20px] border border-black/5 bg-white/90 p-4 text-slate-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-2xl';

  if (showIos) {
    return (
      <div className={shellClass} role="region" aria-label="Install app">
        <div className={panelClass}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl shadow-[0_8px_12px_-3px_rgba(0,0,0,0.12)]">
              <Image
                src="/icon-app-icon-generator.png"
                alt="App Icon Generator icon"
                width={44}
                height={44}
                className="h-11 w-11"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Install App Icon Generator</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                Add to home screen for the best experience
              </p>
              <p className="mt-2 text-[10px] text-slate-500">{iosInstructions(iosFlavor)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1 text-[10px] text-slate-500 sm:flex">
              <span>Tap</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#0A0B14]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 16V4" />
                <path d="M8 8l4-4 4 4" />
                <path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7" />
              </svg>
              <span>then “Add to Home Screen”</span>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-900"
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 0 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass} role="region" aria-label="Install app">
      <div className={panelClass}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-xl shadow-[0_8px_12px_-3px_rgba(0,0,0,0.12)]">
            <Image
              src="/icon-app-icon-generator.png"
              alt="App Icon Generator icon"
              width={44}
              height={44}
              className="h-11 w-11"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">Install App Icon Generator</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              Add to home screen for the best experience
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void onInstallClick()}
            disabled={installing}
            className="rounded-full bg-[#0A0B14] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#121424] disabled:opacity-50 active:scale-[0.96]"
          >
            {installing ? 'Installing…' : 'Install'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-900"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
              <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 0 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
