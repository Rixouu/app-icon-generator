'use client';

import { useState } from 'react';
import IconTypeSelector from './components/IconTypeSelector';
import IconPreview from './components/IconPreview';
import IconSettings from './components/IconSettings';
import type { IconSettingsType } from './components/types';
import DownloadSection from './components/DownloadSection';
import { ThemeSync } from './components/ThemeSync';
import { PwaInstallBanner } from './components/PwaInstallBanner';
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

  const handleDownload = async () => {
    setDownloadError(null);
    if (iconSettings.source.mode === 'image' && !uploadedImage) {
      setDownloadError('Upload a source image or switch the icon source to clipart or text.');
      return;
    }

    if (iconSettings.background.type === 'image' && !backgroundImage) {
      setDownloadError('Upload a background image to use the image background mode.');
      return;
    }

    try {
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
          setDownloadError(data.details ?? data.error ?? 'Generation failed');
        } else {
          setDownloadError(`Request failed (${response.status})`);
        }
        return;
      }

      if (!contentType.includes('application/zip') && !contentType.includes('application/octet-stream')) {
        setDownloadError('Unexpected response from server');
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
    } catch {
      setDownloadError('Network error. Try again.');
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
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <header className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                App assets
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Icon generator
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Create Android, iOS, and web icon packs with uploaded art, clipart, or text,
                then export platform-ready assets.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? 'Light' : 'Dark'}
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

          <div className="mb-5 rounded-2xl border border-border bg-card p-1 lg:hidden">
            <div className="grid grid-cols-3 gap-1">
              {(['preview', 'edit', 'export'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setMobileView(view)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                    mobileView === view
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:hidden">
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
    </>
  );
}
