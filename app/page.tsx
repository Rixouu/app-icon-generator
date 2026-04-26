'use client';

import React, { useState } from 'react';
import IconTypeSelector from './components/IconTypeSelector';
import IconPreview from './components/IconPreview';
import IconSettings from './components/IconSettings';
import FileUpload from './components/FileUpload';
import type { IconSettingsType } from './components/types';
import DownloadSection from './components/DownloadSection';
import { ThemeSync } from './components/ThemeSync';
import { PwaInstallBanner } from './components/PwaInstallBanner';

export default function Home() {
  const [iconType, setIconType] = useState<'android' | 'ios'>('android');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [iconSettings, setIconSettings] = useState<IconSettingsType>({
    icon: { url: '' },
    scaling: 'center',
    effect: 'none',
    padding: 0,
    background: {
      color: '#000000',
      type: 'solid',
      transparent: false,
    },
    shape: 'square',
  });

  const handleDownload = async () => {
    setDownloadError(null);
    if (!uploadedImage) return;

    try {
      const formData = new FormData();
      formData.append('iconType', iconType);
      formData.append('settings', JSON.stringify(iconSettings));
      formData.append('file', uploadedImage);

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
      a.download = 'icons.zip';
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

  const handleSettingsChange = (newSettings: Partial<IconSettingsType>) => {
    setIconSettings((prev) => ({
      ...prev,
      ...newSettings,
      padding:
        typeof newSettings.padding === 'string'
          ? parseInt(newSettings.padding, 10)
          : (newSettings.padding ?? prev.padding),
      background: {
        ...prev.background,
        ...(newSettings.background || {}),
      },
    }));
  };

  return (
    <>
      <ThemeSync isDark={isDarkMode} />
      <PwaInstallBanner />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                App assets
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Icon generator
              </h1>
              <p className="mt-2 max-w-xl text-base text-muted-foreground leading-relaxed">
                Upload artwork, tune padding and shape, then download a ZIP of PNGs for your target
                platform.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="self-start rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted sm:self-auto"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
          </header>

          {downloadError ? (
            <div
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {downloadError}
            </div>
          ) : null}

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="w-full shrink-0 lg:w-[340px]">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <IconTypeSelector selectedType={iconType} onTypeChange={setIconType} />
                <FileUpload onFileUpload={handleImageUpload} />
                <IconSettings
                  settings={iconSettings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-8">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <IconPreview iconType={iconType} uploadedImage={uploadedImage} settings={iconSettings} />
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <DownloadSection onDownload={handleDownload} disabled={!uploadedImage} iconType={iconType} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
