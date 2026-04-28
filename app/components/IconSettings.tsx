import React, { useMemo, useState } from 'react';
import type { IconSettingsType } from './types';
import FileUpload from './FileUpload';
import { BADGE_PRESETS, CLIPART_OPTIONS, type ClipartOption } from '@/utils/iconStudio';

interface IconSettingsProps {
  settings: IconSettingsType;
  onSettingsChange: (newSettings: Partial<IconSettingsType>) => void;
  uploadedImage: File | null;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  backgroundImage: File | null;
  onBackgroundImageUpload: (file: File) => void;
  onBackgroundImageClear: () => void;
}

type SectionKey = 'source' | 'background' | 'shape' | 'badge';

interface SectionCardProps {
  title: string;
  description: string;
  sectionKey: SectionKey;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  badge?: string;
  children: React.ReactNode;
}

const inputClass =
  'w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm text-foreground transition-colors outline-none focus:ring-2 focus:ring-ring/30';

const labelClass = 'mb-2 block text-sm font-medium text-foreground/95';
const chipClass =
  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors';
const sectionCardClass = 'border-b border-border pb-5 last:border-b-0 last:pb-0';
const featureCardClass =
  'rounded-2xl border border-border bg-background px-3 py-3 text-left transition-colors hover:bg-muted/40';
const FEATURED_CLIPART_IDS = ['bolt', 'sparkles', 'rocket', 'shield', 'bag', 'chat'];

function SectionCard({
  title,
  description,
  sectionKey,
  isOpen,
  onToggle,
  badge,
  children,
}: SectionCardProps) {
  return (
    <section className={sectionCardClass}>
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="flex w-full items-start justify-between gap-4 py-2 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
            {badge ? (
              <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 max-w-[28rem] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={`shrink-0 pt-1 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
          </svg>
        </span>
      </button>
      {isOpen ? <div className="pt-4">{children}</div> : null}
    </section>
  );
}

const IconSettings: React.FC<IconSettingsProps> = ({
  settings,
  onSettingsChange,
  uploadedImage,
  onImageUpload,
  onImageClear,
  backgroundImage,
  onBackgroundImageUpload,
  onBackgroundImageClear,
}) => {
  const [clipartSearch, setClipartSearch] = useState('');
  const [clipartCategory, setClipartCategory] = useState('All');
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    source: true,
    background: true,
    shape: false,
    badge: false,
  });

  const clipartLookup = useMemo(
    () => new Map(CLIPART_OPTIONS.map((option) => [option.id, option])),
    [],
  );
  const clipartCategories = useMemo(
    () => ['All', ...new Set(CLIPART_OPTIONS.map((option) => option.category))],
    [],
  );
  const featuredClipart = useMemo(
    () =>
      FEATURED_CLIPART_IDS.map((id) => clipartLookup.get(id)).filter(
        (option): option is ClipartOption => Boolean(option),
      ),
    [clipartLookup],
  );
  const filteredClipart = useMemo(() => {
    const query = clipartSearch.trim().toLowerCase();
    return CLIPART_OPTIONS.filter((option) => {
      const matchesCategory = clipartCategory === 'All' || option.category === clipartCategory;
      const matchesQuery =
        !query ||
        option.label.toLowerCase().includes(query) ||
        option.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [clipartCategory, clipartSearch]);
  const toggleSection = (key: SectionKey) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  };
  const selectClipart = (id: string) =>
    onSettingsChange({
      source: {
        ...settings.source,
        clipart: id,
      },
    });
  const badgeStateLabel = settings.badge.enabled ? settings.badge.text || 'Enabled' : 'Off';
  const backgroundStateLabel = settings.background.transparent
    ? 'Transparent'
    : settings.background.type;

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground">Editor</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune the source, background, shape, and badge without leaving the workspace.
        </p>
      </div>
      <div className="space-y-5">
      <SectionCard
        title="Source"
        description="Choose artwork, clipart, or text for the icon foreground."
        sectionKey="source"
        isOpen={openSections.source}
        onToggle={toggleSection}
        badge={settings.source.mode}
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="sourceModeSelect">
              Icon source
            </label>
            <select
              id="sourceModeSelect"
              value={settings.source.mode}
              onChange={(e) =>
                onSettingsChange({
                  source: {
                    ...settings.source,
                    mode: e.target.value as 'image' | 'clipart' | 'text',
                  },
                })
              }
              className={inputClass}
            >
              <option value="image">Uploaded image</option>
              <option value="clipart">Clipart</option>
              <option value="text">Text</option>
            </select>
          </div>

          {settings.source.mode === 'image' ? (
            <FileUpload
              onFileUpload={onImageUpload}
              title="Upload source image"
              description="Main foreground artwork used for image mode"
              selectedFileName={uploadedImage?.name ?? null}
              onClear={onImageClear}
              className="mb-0"
            />
          ) : null}

          {settings.source.mode === 'clipart' ? (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className={labelClass}>Featured clipart</span>
                  <span className="text-xs text-muted-foreground">Quick picks</span>
                </div>
                <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
                  {featuredClipart.map((option) => {
                    const selected = settings.source.clipart === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectClipart(option.id)}
                        className={`${featureCardClass} ${
                          selected
                            ? 'border-ring bg-muted text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        } min-w-[168px] shrink-0 snap-start`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                              selected
                                ? 'border-ring/40 bg-ring/10 text-ring'
                                : 'border-border bg-muted/40 text-foreground'
                            }`}
                          >
                            <svg
                              viewBox={option.viewBox ?? '0 0 24 24'}
                              className="h-5 w-5 fill-current"
                              aria-hidden="true"
                            >
                              <path d={option.svgPath} />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1 text-left">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block leading-tight text-xs text-muted-foreground">
                              {option.category} clipart
                            </span>
                          </span>
                          {selected ? (
                            <span className="ml-auto shrink-0 rounded-full bg-ring px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Active
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className={labelClass}>Categories</span>
                <div className="flex flex-wrap gap-2">
                  {clipartCategories.map((category) => {
                    const selected = clipartCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setClipartCategory(category)}
                        className={`${chipClass} ${
                          selected
                            ? 'border border-ring bg-muted text-foreground'
                            : 'border border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="clipartSearch">
                  Search clipart
                </label>
                <input
                  id="clipartSearch"
                  type="text"
                  value={clipartSearch}
                  onChange={(e) => setClipartSearch(e.target.value)}
                  className={inputClass}
                  placeholder="Search by icon or category"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 rounded-2xl bg-muted/30 p-2 sm:grid-cols-5">
                {filteredClipart.map((option) => {
                  const selected = settings.source.clipart === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectClipart(option.id)}
                      className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                        selected
                          ? 'border-ring bg-card text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                      title={option.label}
                      aria-label={option.label}
                    >
                      <svg viewBox={option.viewBox ?? '0 0 24 24'} className="h-5 w-5 fill-current">
                        <path d={option.svgPath} />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {filteredClipart.length === 0 ? (
                <p className="text-xs text-muted-foreground">No clipart matches your search.</p>
              ) : null}
            </div>
          ) : null}

          {settings.source.mode === 'text' ? (
            <div>
              <label className={labelClass} htmlFor="textInput">
                Text
              </label>
              <input
                id="textInput"
                type="text"
                maxLength={3}
                value={settings.source.text}
                onChange={(e) =>
                  onSettingsChange({
                    source: {
                      ...settings.source,
                      text: e.target.value.toUpperCase(),
                    },
                  })
                }
                className={inputClass}
                placeholder="AI"
              />
            </div>
          ) : null}

          {settings.source.mode !== 'image' ? (
            <div>
              <label className={labelClass} htmlFor="sourceColor">
                Foreground color
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-3">
                <input
                  id="sourceColor"
                  type="color"
                  value={settings.source.color}
                  onChange={(e) =>
                    onSettingsChange({
                      source: {
                        ...settings.source,
                        color: e.target.value,
                      },
                    })
                  }
                  className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0"
                />
                <span className="font-mono text-xs text-muted-foreground">{settings.source.color}</span>
              </div>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Background"
        description="Control fill, gradients, mesh, or a separate background image."
        sectionKey="background"
        isOpen={openSections.background}
        onToggle={toggleSection}
        badge={backgroundStateLabel}
      >
        <div className="space-y-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-3 text-sm text-foreground">
            <input
              id="bgTransparent"
              type="checkbox"
              checked={settings.background.transparent === true}
              onChange={(e) =>
                onSettingsChange({
                  background: {
                    ...settings.background,
                    transparent: e.target.checked,
                  },
                })
              }
              className="mt-0.5 size-4 rounded border-border text-ring focus:ring-ring"
            />
            <span>
              <span className="block font-medium text-foreground">Transparent export</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Empty areas stay alpha-transparent in the downloaded PNG assets.
              </span>
            </span>
          </label>

          <div
            className={`space-y-5 ${settings.background.transparent ? 'pointer-events-none opacity-40' : ''}`}
          >
            <div>
              <label className={labelClass} htmlFor="bgTypeSelect">
                Background type
              </label>
              <select
                id="bgTypeSelect"
                value={settings.background.type}
                disabled={settings.background.transparent === true}
                onChange={(e) =>
                  onSettingsChange({
                    background: {
                      ...settings.background,
                      type: e.target.value as 'solid' | 'gradient' | 'mesh' | 'image',
                    },
                  })
                }
                className={inputClass}
              >
                <option value="solid">Solid</option>
                <option value="gradient">Gradient</option>
                <option value="mesh">Mesh</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="bgColor">
                Base color
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-3">
                <input
                  id="bgColor"
                  type="color"
                  aria-label="Background color"
                  value={settings.background.color}
                  disabled={settings.background.transparent === true}
                  onChange={(e) =>
                    onSettingsChange({
                      background: {
                        ...settings.background,
                        color: e.target.value,
                      },
                    })
                  }
                  className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0 disabled:cursor-not-allowed"
                />
                <span className="font-mono text-xs text-muted-foreground">{settings.background.color}</span>
              </div>
            </div>

            {settings.background.type === 'gradient' ? (
              <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Start color</label>
                    <div className="flex items-center gap-3">
                      <input
                        aria-label="Gradient start color"
                        type="color"
                        value={settings.background.gradient?.colors[0] ?? settings.background.color}
                        onChange={(e) =>
                          onSettingsChange({
                            background: {
                              ...settings.background,
                              gradient: {
                                colors: [
                                  e.target.value,
                                  settings.background.gradient?.colors[1] ?? settings.background.color,
                                ],
                                angle: settings.background.gradient?.angle ?? 135,
                              },
                            },
                          })
                        }
                        className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {settings.background.gradient?.colors[0] ?? settings.background.color}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>End color</label>
                    <div className="flex items-center gap-3">
                      <input
                        aria-label="Gradient end color"
                        type="color"
                        value={settings.background.gradient?.colors[1] ?? '#9c7bff'}
                        onChange={(e) =>
                          onSettingsChange({
                            background: {
                              ...settings.background,
                              gradient: {
                                colors: [
                                  settings.background.gradient?.colors[0] ?? settings.background.color,
                                  e.target.value,
                                ],
                                angle: settings.background.gradient?.angle ?? 135,
                              },
                            },
                          })
                        }
                        className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {settings.background.gradient?.colors[1] ?? '#9c7bff'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="gradientAngle">
                    Gradient angle
                  </label>
                  <input
                    id="gradientAngle"
                    type="range"
                    min={0}
                    max={360}
                    value={settings.background.gradient?.angle ?? 135}
                    onChange={(e) =>
                      onSettingsChange({
                        background: {
                          ...settings.background,
                          gradient: {
                            colors: [
                              settings.background.gradient?.colors[0] ?? settings.background.color,
                              settings.background.gradient?.colors[1] ?? '#9c7bff',
                            ],
                            angle: parseInt(e.target.value, 10),
                          },
                        },
                      })
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {settings.background.gradient?.angle ?? 135}deg
                  </span>
                </div>
              </div>
            ) : null}

            {settings.background.type === 'mesh' ? (
              <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    settings.background.mesh?.colors[0] ?? settings.background.color,
                    settings.background.mesh?.colors[1] ?? '#9c7bff',
                    settings.background.mesh?.colors[2] ?? '#2dd4bf',
                  ].map((color, index) => (
                    <div key={`${color}-${index}`}>
                      <label className={labelClass}>Blob {index + 1}</label>
                      <div className="flex items-center gap-3">
                        <input
                          aria-label={`Mesh color ${index + 1}`}
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const colors = [
                              settings.background.mesh?.colors[0] ?? settings.background.color,
                              settings.background.mesh?.colors[1] ?? '#9c7bff',
                              settings.background.mesh?.colors[2] ?? '#2dd4bf',
                            ] as [string, string, string];
                            colors[index] = e.target.value;
                            onSettingsChange({
                              background: {
                                ...settings.background,
                                mesh: { colors },
                              },
                            });
                          }}
                          className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0"
                        />
                        <span className="font-mono text-xs text-muted-foreground">{color}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {settings.background.type === 'image' ? (
              <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Upload a dedicated image for the background layer.
                </p>
                <FileUpload
                  onFileUpload={onBackgroundImageUpload}
                  title="Upload background image"
                  description="Used only behind the foreground icon"
                  selectedFileName={backgroundImage?.name ?? null}
                  onClear={onBackgroundImageClear}
                  className="mb-0"
                />
                <div>
                  <label className={labelClass} htmlFor="bgImageBlur">
                    Image blur
                  </label>
                  <input
                    id="bgImageBlur"
                    type="range"
                    min={0}
                    max={24}
                    value={settings.background.image?.blur ?? 8}
                    onChange={(e) =>
                      onSettingsChange({
                        background: {
                          ...settings.background,
                          image: {
                            blur: parseInt(e.target.value, 10),
                            opacity: settings.background.image?.opacity ?? 60,
                            grayscale: settings.background.image?.grayscale ?? false,
                          },
                        },
                      })
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {settings.background.image?.blur ?? 8}px
                  </span>
                </div>
                <div>
                  <label className={labelClass} htmlFor="bgImageOpacity">
                    Image opacity
                  </label>
                  <input
                    id="bgImageOpacity"
                    type="range"
                    min={10}
                    max={100}
                    value={settings.background.image?.opacity ?? 60}
                    onChange={(e) =>
                      onSettingsChange({
                        background: {
                          ...settings.background,
                          image: {
                            blur: settings.background.image?.blur ?? 8,
                            opacity: parseInt(e.target.value, 10),
                            grayscale: settings.background.image?.grayscale ?? false,
                          },
                        },
                      })
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {settings.background.image?.opacity ?? 60}%
                  </span>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={settings.background.image?.grayscale ?? false}
                    onChange={(e) =>
                      onSettingsChange({
                        background: {
                          ...settings.background,
                          image: {
                            blur: settings.background.image?.blur ?? 8,
                            opacity: settings.background.image?.opacity ?? 60,
                            grayscale: e.target.checked,
                          },
                        },
                      })
                    }
                    className="size-4 rounded border-border text-ring focus:ring-ring"
                  />
                  <span>Grayscale background image</span>
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Shape"
        description="Adjust mask, spacing, and finishing effects."
        sectionKey="shape"
        isOpen={openSections.shape}
        onToggle={toggleSection}
        badge={settings.shape}
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="shapeSelect">
              Shape
            </label>
            <select
              id="shapeSelect"
              value={settings.shape}
              onChange={(e) =>
                onSettingsChange({
                  shape: e.target.value as 'square' | 'circle' | 'squircle' | 'rounded',
                })
              }
              className={inputClass}
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="squircle">Squircle</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>

          {settings.shape === 'rounded' ? (
            <div>
              <label className={labelClass} htmlFor="borderRadiusInput">
                Corner roundness
              </label>
              <input
                id="borderRadiusInput"
                type="range"
                min={8}
                max={48}
                value={settings.borderRadius ?? 24}
                onChange={(e) => onSettingsChange({ borderRadius: parseInt(e.target.value, 10) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {settings.borderRadius ?? 24}
              </span>
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor="effectSelect">
              Effect
            </label>
            <select
              id="effectSelect"
              value={settings.effect}
              onChange={(e) =>
                onSettingsChange({ effect: e.target.value as 'none' | 'shadow' | 'gloss' })
              }
              className={inputClass}
            >
              <option value="none">None</option>
              <option value="shadow">Shadow</option>
              <option value="gloss">Gloss</option>
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="paddingInput">
              Padding
            </label>
            <input
              id="paddingInput"
              type="range"
              min={0}
              max={35}
              value={settings.padding}
              onChange={(e) => onSettingsChange({ padding: parseInt(e.target.value, 10) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
            />
            <span className="mt-1 block text-xs text-muted-foreground">{settings.padding}%</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Badge"
        description="Add a small preset or custom status marker to the icon."
        sectionKey="badge"
        isOpen={openSections.badge}
        onToggle={toggleSection}
        badge={badgeStateLabel}
      >
        <div className="space-y-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-3 text-sm text-foreground">
            <input
              id="badgeEnabled"
              type="checkbox"
              checked={settings.badge.enabled}
              onChange={(e) =>
                onSettingsChange({
                  badge: {
                    ...settings.badge,
                    enabled: e.target.checked,
                  },
                })
              }
              className="mt-0.5 size-4 rounded border-border text-ring focus:ring-ring"
            />
            <span>
              <span className="block font-medium text-foreground">Show badge</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Useful for release channels, status, or product tiers.
              </span>
            </span>
          </label>

          {settings.badge.enabled ? (
            <div className="space-y-4">
              <div>
                <span className={labelClass}>Badge presets</span>
                <div className="flex flex-wrap gap-2">
                  {BADGE_PRESETS.map((preset) => {
                    const active =
                      settings.badge.text === preset.text &&
                      settings.badge.color === preset.color &&
                      settings.badge.textColor === preset.textColor;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          onSettingsChange({
                            badge: {
                              ...settings.badge,
                              text: preset.text,
                              color: preset.color,
                              textColor: preset.textColor,
                            },
                          })
                        }
                        className={`${chipClass} ${
                          active
                            ? 'border border-ring bg-muted text-foreground'
                            : 'border border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="badgeText">
                  Badge text
                </label>
                <input
                  id="badgeText"
                  type="text"
                  maxLength={4}
                  value={settings.badge.text}
                  onChange={(e) =>
                    onSettingsChange({
                      badge: {
                        ...settings.badge,
                        text: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  className={inputClass}
                  placeholder="NEW"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="badgeColor">
                    Badge color
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-3">
                    <input
                      id="badgeColor"
                      type="color"
                      value={settings.badge.color}
                      onChange={(e) =>
                        onSettingsChange({
                          badge: {
                            ...settings.badge,
                            color: e.target.value,
                          },
                        })
                      }
                      className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0"
                    />
                    <span className="font-mono text-xs text-muted-foreground">{settings.badge.color}</span>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="badgeTextColor">
                    Text color
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-3">
                    <input
                      id="badgeTextColor"
                      type="color"
                      value={settings.badge.textColor}
                      onChange={(e) =>
                        onSettingsChange({
                          badge: {
                            ...settings.badge,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0"
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {settings.badge.textColor}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="badgePosition">
                  Badge position
                </label>
                <select
                  id="badgePosition"
                  value={settings.badge.position}
                  onChange={(e) =>
                    onSettingsChange({
                      badge: {
                        ...settings.badge,
                        position: e.target.value as
                          | 'top-left'
                          | 'top-right'
                          | 'bottom-left'
                          | 'bottom-right',
                      },
                    })
                  }
                  className={inputClass}
                >
                  <option value="top-left">Top left</option>
                  <option value="top-right">Top right</option>
                  <option value="bottom-left">Bottom left</option>
                  <option value="bottom-right">Bottom right</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </SectionCard>
      </div>
    </div>
  );
};

export default IconSettings;
