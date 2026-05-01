'use client';

import { useMemo, useState } from 'react';
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

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushToast = (title: string, description?: string, variant: ToastVariant = 'default') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    window.setTimeout(() => dismissToast(id), 3800);
  };

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
      <div className="min-h-screen bg-background [--mobile-nav-offset:68px] lg:[--mobile-nav-offset:0px]">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  App assets
                </p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  Icon generator
                </h1>
                <p className="mt-1 hidden max-w-2xl text-xs leading-relaxed text-muted-foreground sm:block">
                  Create Android, iOS, and web icon packs with uploaded art, clipart, or text.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  {isDarkMode ? (
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </>
                  )}
                </svg>
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-2 lg:hidden">
            {(['android', 'ios', 'web', 'all'] as const).map((type) => {
              const selected = iconType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setIconType(type)}
                  className={`rounded-xl px-2 py-2 text-xs font-medium transition-colors ${
                    selected ? 'bg-ring text-[#021714]' : 'bg-muted text-muted-foreground hover:bg-card'
                  }`}
                >
                  {type === 'android' ? 'Android' : type === 'ios' ? 'iOS' : type === 'web' ? 'Web' : 'All'}
                </button>
              );
            })}
          </div>

          {downloadError ? (
            <div
              className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {downloadError}
            </div>
          ) : null}

          <div className="space-y-4 pb-[calc(var(--mobile-nav-offset)+max(env(safe-area-inset-bottom,0px),0.75rem))] lg:hidden">
            {mobileView === 'preview' ? (
              <section className="rounded-2xl border border-border bg-card p-4">
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
              <section className="rounded-2xl border border-border bg-card p-4">
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
            <div className="border-t border-border bg-card px-4 pb-[max(env(safe-area-inset-bottom,0px),1rem)] pt-3">
              <div className="mx-auto flex max-w-[420px] items-center justify-between">
                {mobileTabs.map((item) => {
                  const selected = mobileView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMobileView(item.id)}
                      className="flex flex-1 flex-col items-center gap-1"
                      aria-current={selected ? 'page' : undefined}
                    >
                      <span
                        className={`flex h-7 w-10 items-center justify-center rounded-lg transition-colors ${
                          selected ? 'bg-muted' : ''
                        }`}
                      >
                        {item.id === 'preview' ? (
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-[18px] w-[18px] ${selected ? 'text-ring' : 'text-muted-foreground'}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <rect x="3" y="3" width="8" height="8" rx="2" />
                            <rect x="13" y="3" width="8" height="8" rx="2" />
                            <rect x="3" y="13" width="8" height="8" rx="2" />
                            <rect x="13" y="13" width="8" height="8" rx="2" />
                          </svg>
                        ) : null}
                        {item.id === 'edit' ? (
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-[18px] w-[18px] ${selected ? 'text-ring' : 'text-muted-foreground'}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M12 20H4a1 1 0 0 1-1-1v-3.2a2 2 0 0 1 .6-1.4L14.8 3.2a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L9.6 20.4a2 2 0 0 1-1.4.6Z" />
                            <path d="M14 6l4 4" />
                          </svg>
                        ) : null}
                        {item.id === 'export' ? (
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-[18px] w-[18px] ${selected ? 'text-ring' : 'text-muted-foreground'}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="M12 3v12" />
                            <path d="M17 8l-5-5-5 5" />
                          </svg>
                        ) : null}
                      </span>
                      <span className={`text-[10px] font-medium ${selected ? 'text-ring' : 'text-muted-foreground'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="hidden lg:grid lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-0 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
            <aside className="border-r border-border bg-card">
              <div className="sticky top-0 p-4">
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

            <main className="bg-background p-4">
              <div className="sticky top-4">
                <section className="h-full rounded-2xl border border-border bg-card p-4">
                  <IconPreview
                    iconType={iconType}
                    uploadedImage={uploadedImage}
                    backgroundImage={backgroundImage}
                    settings={iconSettings}
                  />
                </section>
              </div>
            </main>

            <aside className="border-l border-border bg-card">
              <div className="sticky top-0 px-5 py-4 xl:px-6">
                <div className="space-y-5">
                  <IconTypeSelector selectedType={iconType} onTypeChange={setIconType} />
                  <DownloadSection
                    onDownload={handleDownload}
                    disabled={
                      (iconSettings.source.mode === 'image' && !uploadedImage) ||
                      (iconSettings.background.type === 'image' && !backgroundImage)
                    }
                    iconType={iconType}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
