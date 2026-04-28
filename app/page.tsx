'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import IconTypeSelector from './components/IconTypeSelector';
import IconPreview from './components/IconPreview';
import IconSettings from './components/IconSettings';
import type { IconSettingsType } from './components/types';
import DownloadSection from './components/DownloadSection';
import { ThemeSync } from './components/ThemeSync';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { ToastViewport, type ToastItem, type ToastVariant } from './components/ToastViewport';
import {
  DEFAULT_ICON_SETTINGS,
  type PlatformType,
} from '@/utils/iconStudio';

export default function Home() {
  const [iconType, setIconType] = useState<PlatformType>('android');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileView, setMobileView] = useState<'preview' | 'edit' | 'export'>('preview');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [iconSettings, setIconSettings] = useState<IconSettingsType>(DEFAULT_ICON_SETTINGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mobileTabs = useMemo(
    () =>
      [
        { id: 'preview', label: 'Preview' },
        { id: 'edit', label: 'Edit' },
        { id: 'export', label: 'Export' },
      ] as const,
    [],
  );
  const activeMobileIndex = Math.max(
    0,
    mobileTabs.findIndex((t) => t.id === mobileView),
  );
  const pillRef = useRef<HTMLDivElement | null>(null);
  const prevMobileIndexRef = useRef(activeMobileIndex);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushToast = (title: string, description?: string, variant: ToastVariant = 'default') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    window.setTimeout(() => dismissToast(id), 3800);
  };

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill || typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prev = prevMobileIndexRef.current;
    const next = activeMobileIndex;
    const toTransform = `translateX(${next * 100}%)`;
    if (prev === next || prefersReduced) {
      pill.style.transform = toTransform;
      prevMobileIndexRef.current = next;
      return;
    }

    const direction = next > prev ? 1 : -1;
    const fromTransform = `translateX(${prev * 100}%)`;
    const overshootTransform = `translateX(${next * 100 + direction * 10}%)`;
    pill.getAnimations().forEach((animation) => animation.cancel());
    pill.animate(
      [
        { transform: fromTransform },
        { transform: overshootTransform, offset: 0.78 },
        { transform: toTransform },
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
        fill: 'both',
      },
    );
    pill.style.transform = toTransform;
    prevMobileIndexRef.current = next;
  }, [activeMobileIndex]);

  const handleDownload = async () => {
    setDownloadError(null);
    if (iconSettings.source.mode === 'image' && !uploadedImage) {
      const message = 'Upload a source image or switch the icon source to clipart or text.';
      setDownloadError(message);
      pushToast('Missing source', message, 'error');
      return;
    }

    if (iconSettings.background.type === 'image' && !backgroundImage) {
      const message = 'Upload a background image to use the image background mode.';
      setDownloadError(message);
      pushToast('Missing background', message, 'error');
      return;
    }

    try {
      pushToast('Preparing download', 'Generating a ZIP with your icon set…');
      const formData = new FormData();
      formData.append('iconType', iconType);
      formData.append('settings', JSON.stringify(iconSettings));
      if (uploadedImage) {
        formData.append('file', uploadedImage);
      }
      if (backgroundImage) {
        formData.append('backgroundFile', backgroundImage);
      }

      const response = await fetch('/api/generate-icons', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const data = (await response.json()) as { error?: string; details?: string };
          const message = data.details ?? data.error ?? 'Generation failed';
          setDownloadError(message);
          pushToast('Export failed', message, 'error');
        } else {
          const message = `Request failed (${response.status})`;
          setDownloadError(message);
          pushToast('Export failed', message, 'error');
        }
        return;
      }

      if (!contentType.includes('application/zip') && !contentType.includes('application/octet-stream')) {
        const message = 'Unexpected response from server';
        setDownloadError(message);
        pushToast('Export failed', message, 'error');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${iconType}-icons.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      pushToast('Download started', 'Your ZIP is downloading now.', 'success');
    } catch {
      const message = 'Network error. Try again.';
      setDownloadError(message);
      pushToast('Export failed', message, 'error');
    }
  };

  const toggleDarkMode = () => setIsDarkMode((d) => !d);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setDownloadError(null);
  };

  const handleBackgroundImageUpload = (file: File) => {
    setBackgroundImage(file);
    setDownloadError(null);
  };

  const handleSettingsChange = (newSettings: Partial<IconSettingsType>) => {
    setIconSettings((prev) => ({
      ...prev,
      ...newSettings,
      padding:
        typeof newSettings.padding === 'string'
          ? parseInt(newSettings.padding, 10)
          : (newSettings.padding ?? prev.padding),
      source: {
        ...prev.source,
        ...(newSettings.source || {}),
      },
      background: {
        ...prev.background,
        ...(newSettings.background || {}),
        gradient: {
          ...(prev.background.gradient || { colors: [prev.background.color, prev.background.color], angle: 135 }),
          ...(newSettings.background?.gradient || {}),
          colors:
            newSettings.background?.gradient?.colors ||
            prev.background.gradient?.colors ||
            [prev.background.color, prev.background.color],
        },
        mesh: {
          ...(prev.background.mesh || { colors: [prev.background.color, '#9c7bff', '#2dd4bf'] }),
          ...(newSettings.background?.mesh || {}),
          colors:
            newSettings.background?.mesh?.colors ||
            prev.background.mesh?.colors ||
            [prev.background.color, '#9c7bff', '#2dd4bf'],
        },
        image: {
          ...(prev.background.image || { blur: 8, opacity: 60, grayscale: false }),
          ...(newSettings.background?.image || {}),
        },
      },
      badge: {
        ...prev.badge,
        ...(newSettings.badge || {}),
      },
    }));
  };

  return (
    <>
      <ThemeSync isDark={isDarkMode} />
      <PwaInstallBanner />
      <div className="min-h-screen bg-background [--mobile-nav-offset:76px] lg:[--mobile-nav-offset:0px]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <header className="relative mb-6 flex flex-col items-center gap-4 text-center lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted lg:hidden"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              )}
            </button>

            <div className="min-w-0 lg:pr-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                App assets
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Icon generator
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
                Create Android, iOS, and web icon packs with uploaded art, clipart, or text, then export
                platform-ready assets.
              </p>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-foreground">
                  {isDarkMode ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </svg>
                  )}
                </span>
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </header>

          {downloadError ? (
            <div
              className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {downloadError}
            </div>
          ) : null}

          <div className="space-y-5 pb-[calc(var(--mobile-nav-offset)+max(env(safe-area-inset-bottom,0px),0.75rem))] lg:hidden">
            {mobileView === 'preview' ? (
              <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <IconPreview
                  iconType={iconType}
                  uploadedImage={uploadedImage}
                  backgroundImage={backgroundImage}
                  settings={iconSettings}
                />
              </section>
            ) : null}

            {mobileView === 'edit' ? (
              <>
                <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <IconTypeSelector selectedType={iconType} onTypeChange={setIconType} />
                </section>
                <IconSettings
                  settings={iconSettings}
                  onSettingsChange={handleSettingsChange}
                  uploadedImage={uploadedImage}
                  onImageUpload={handleImageUpload}
                  onImageClear={() => setUploadedImage(null)}
                  backgroundImage={backgroundImage}
                  onBackgroundImageUpload={handleBackgroundImageUpload}
                  onBackgroundImageClear={() => setBackgroundImage(null)}
                />
              </>
            ) : null}

            {mobileView === 'export' ? (
              <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <DownloadSection
                  onDownload={handleDownload}
                  disabled={
                    (iconSettings.source.mode === 'image' && !uploadedImage) ||
                    (iconSettings.background.type === 'image' && !backgroundImage)
                  }
                  iconType={iconType}
                />
              </section>
            ) : null}
          </div>

          <nav
            className="fixed bottom-0 left-0 right-0 z-[95] lg:hidden"
            role="navigation"
            aria-label="Mobile views"
          >
            <div className="mx-auto max-w-7xl px-4 pb-[max(env(safe-area-inset-bottom,0px),0.8rem)] pt-2.5">
              <div className="rounded-[28px] border border-border bg-card/85 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.45)] backdrop-blur dark:border-white/10">
                <div className="relative grid grid-cols-3 gap-2">
                  <div
                    ref={pillRef}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 rounded-[22px] bg-foreground shadow-[0_10px_26px_rgba(0,0,0,0.35)] motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                  {mobileTabs.map((item) => {
                    const selected = mobileView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                            try {
                              navigator.vibrate(10);
                            } catch {
                              /* ignore */
                            }
                          }
                          setMobileView(item.id);
                        }}
                        className={`relative z-[1] flex flex-col items-center justify-center gap-0.5 rounded-[22px] px-3 py-2 text-[11px] font-semibold transition-[transform,color] duration-150 active:scale-[0.96] motion-reduce:transition-none ${
                          selected ? 'text-background' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        aria-current={selected ? 'page' : undefined}
                      >
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl transition-all duration-200 motion-reduce:transition-none ${
                            selected ? 'bg-white/10 opacity-100 scale-[1.07]' : 'bg-transparent opacity-80 scale-100'
                          }`}
                        >
                          {item.id === 'preview' ? (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-[18px] w-[18px]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : null}
                          {item.id === 'edit' ? (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-[18px] w-[18px]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 20H4a1 1 0 0 1-1-1v-3.2a2 2 0 0 1 .6-1.4L14.8 3.2a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L9.6 20.4a2 2 0 0 1-1.4.6Z" />
                              <path d="M14 6l4 4" />
                            </svg>
                          ) : null}
                          {item.id === 'export' ? (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-[18px] w-[18px]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 3v10" />
                              <path d="M8 9l4 4 4-4" />
                              <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                            </svg>
                          ) : null}
                        </span>
                        <span className={selected ? 'tracking-tight' : undefined}>{item.label}</span>
                        <span
                          className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-200 motion-reduce:transition-none ${
                            selected ? 'scale-100 opacity-100 bg-background shadow-sm' : 'scale-50 opacity-0 bg-transparent'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>

          <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 xl:grid-cols-[minmax(0,1.1fr)_400px]">
            <div className="min-w-0 space-y-6">
              <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                <IconPreview
                  iconType={iconType}
                  uploadedImage={uploadedImage}
                  backgroundImage={backgroundImage}
                  settings={iconSettings}
                />
              </section>
              <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                <DownloadSection
                  onDownload={handleDownload}
                  disabled={
                    (iconSettings.source.mode === 'image' && !uploadedImage) ||
                    (iconSettings.background.type === 'image' && !backgroundImage)
                  }
                  iconType={iconType}
                />
              </section>
            </div>

            <aside className="min-w-0">
              <div className="sticky top-6 space-y-5">
                <div className="rounded-[32px] border border-border bg-card p-5 shadow-sm">
                  <IconTypeSelector selectedType={iconType} onTypeChange={setIconType} />
                </div>
                <IconSettings
                  settings={iconSettings}
                  onSettingsChange={handleSettingsChange}
                  uploadedImage={uploadedImage}
                  onImageUpload={handleImageUpload}
                  onImageClear={() => setUploadedImage(null)}
                  backgroundImage={backgroundImage}
                  onBackgroundImageUpload={handleBackgroundImageUpload}
                  onBackgroundImageClear={() => setBackgroundImage(null)}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
