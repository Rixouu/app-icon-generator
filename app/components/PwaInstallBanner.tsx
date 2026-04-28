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
    'fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom,0px))+var(--mobile-nav-offset))] left-3 right-3 z-[100] rounded-[22px] border border-black/10 bg-white p-4 text-slate-900 shadow-[0_14px_40px_rgba(15,23,42,0.18)] sm:left-1/2 sm:right-auto sm:w-[min(640px,calc(100vw-1.5rem))] sm:-translate-x-1/2';

  if (showIos) {
    return (
      <div className={shellClass} role="region" aria-label="Install app">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
              <Image
                src="/icon-app-icon-generator.png"
                alt="App Icon Generator icon"
                width={52}
                height={52}
                className="h-[52px] w-[52px]"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Install App Icon Generator</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Add this tool to your home screen for faster access.
              </p>
              <p className="mt-1.5 text-xs text-slate-600">{iosInstructions(iosFlavor)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass} role="region" aria-label="Install app">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
            <Image
              src="/icon-app-icon-generator.png"
              alt="App Icon Generator icon"
              width={52}
              height={52}
              className="h-[52px] w-[52px]"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Install App Icon Generator</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Add this tool to your home screen or app launcher.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void onInstallClick()}
            disabled={installing}
            className="rounded-lg bg-[#7044ff] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {installing ? 'Installing…' : 'Install'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
