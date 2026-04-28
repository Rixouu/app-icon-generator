'use client';

import React, { useEffect, useRef } from 'react';
import type { IconPreviewProps } from './types';
import { CLIPART_OPTIONS, getPlatformLabel } from '@/utils/iconStudio';

function drawContainImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  padding: number,
  paddedSize: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw === 0 || ih === 0) return;

  const scale = Math.min(paddedSize / iw, paddedSize / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = padding + (paddedSize - dw) / 2;
  const dy = padding + (paddedSize - dh) / 2;
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, size: number) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw === 0 || ih === 0) return;

  const scale = Math.max(size / iw, size / ih);
  const sw = size / scale;
  const sh = size / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
}

function drawCheckerboard(ctx: CanvasRenderingContext2D, size: number, cell = 14) {
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const dark = ((x / cell + y / cell) | 0) % 2 === 0;
      ctx.fillStyle = dark ? '#d4d8e0' : '#eef0f5';
      ctx.fillRect(x, y, cell, cell);
    }
  }
}

function fillShapePath(
  ctx: CanvasRenderingContext2D,
  size: number,
  padding: number,
  paddedSize: number,
  shape: string,
  borderRadius = 24,
) {
  ctx.beginPath();
  if (shape === 'square') {
    ctx.rect(padding, padding, paddedSize, paddedSize);
    return;
  }
  if (shape === 'circle') {
    ctx.arc(size / 2, size / 2, paddedSize / 2, 0, Math.PI * 2);
    return;
  }
  if (shape === 'squircle' || shape === 'rounded') {
    const r = shape === 'rounded' ? Math.max(8, (borderRadius / 100) * paddedSize) : paddedSize * 0.2;
    const p = padding;
    ctx.moveTo(p + r, p);
    ctx.lineTo(size - p - r, p);
    ctx.quadraticCurveTo(size - p, p, size - p, p + r);
    ctx.lineTo(size - p, size - p - r);
    ctx.quadraticCurveTo(size - p, size - p, size - p - r, size - p);
    ctx.lineTo(p + r, size - p);
    ctx.quadraticCurveTo(p, size - p, p, size - p - r);
    ctx.lineTo(p, p + r);
    ctx.quadraticCurveTo(p, p, p + r, p);
    ctx.closePath();
  }
}

function drawMeshBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  colors: [string, string, string],
  baseColor: string,
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const circles = [
    { x: size * 0.2, y: size * 0.18, r: size * 0.62, color: colors[0] },
    { x: size * 0.8, y: size * 0.22, r: size * 0.66, color: colors[1] },
    { x: size * 0.52, y: size * 0.82, r: size * 0.7, color: colors[2] },
  ];

  circles.forEach((circle) => {
    const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.r);
    gradient.addColorStop(0, circle.color);
    gradient.addColorStop(1, `${circle.color}00`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
}

function drawBadge(ctx: CanvasRenderingContext2D, size: number, settings: IconPreviewProps['settings']) {
  if (!settings.badge.enabled) return;

  const badgeSize = size * 0.28;
  const inset = size * 0.04;
  let x = size - badgeSize - inset;
  let y = inset;

  if (settings.badge.position === 'top-left') x = inset;
  if (settings.badge.position === 'bottom-left') {
    x = inset;
    y = size - badgeSize - inset;
  }
  if (settings.badge.position === 'bottom-right') {
    y = size - badgeSize - inset;
  }

  ctx.save();
  ctx.fillStyle = settings.badge.color;
  const r = badgeSize * 0.34;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + badgeSize - r, y);
  ctx.quadraticCurveTo(x + badgeSize, y, x + badgeSize, y + r);
  ctx.lineTo(x + badgeSize, y + badgeSize - r);
  ctx.quadraticCurveTo(x + badgeSize, y + badgeSize, x + badgeSize - r, y + badgeSize);
  ctx.lineTo(x + r, y + badgeSize);
  ctx.quadraticCurveTo(x, y + badgeSize, x, y + badgeSize - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = settings.badge.textColor;
  ctx.font = `700 ${Math.round(badgeSize * 0.28)}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((settings.badge.text || 'NEW').slice(0, 4).toUpperCase(), x + badgeSize / 2, y + badgeSize / 2 + 1);
  ctx.restore();
}

async function loadImageFromFile(file: File | null): Promise<{ img: HTMLImageElement | null; url: string | null }> {
  if (!file) {
    return { img: null, url: null };
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new window.Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Unable to load image'));
    img.src = objectUrl;
  });

  return { img, url: objectUrl };
}

const IconPreview: React.FC<IconPreviewProps> = ({
  iconType,
  uploadedImage,
  backgroundImage,
  settings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let revokedUrls: string[] = [];
    let cancelled = false;

    const render = async () => {
      const size = 512;
      canvas.width = size;
      canvas.height = size;

      const padding = Math.round(size * (settings.padding / 100));
      const paddedSize = Math.max(1, size - padding * 2);
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');
      if (!octx) return;

      const [{ img, url }, { img: backgroundImg, url: backgroundUrl }] = await Promise.all([
        loadImageFromFile(uploadedImage),
        loadImageFromFile(backgroundImage),
      ]);
      revokedUrls = [url, backgroundUrl].filter((value): value is string => Boolean(value));
      if (cancelled) return;

      ctx.clearRect(0, 0, size, size);
      octx.clearRect(0, 0, size, size);

      if (settings.background.transparent === true) {
        drawCheckerboard(ctx, size);
      } else if (settings.background.type === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, settings.background.gradient?.colors[0] ?? settings.background.color);
        gradient.addColorStop(1, settings.background.gradient?.colors[1] ?? settings.background.color);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      } else if (settings.background.type === 'mesh') {
        drawMeshBackground(
          ctx,
          size,
          settings.background.mesh?.colors ?? [
            settings.background.color,
            '#9c7bff',
            '#2dd4bf',
          ],
          settings.background.color,
        );
      } else if (settings.background.type === 'image' && backgroundImg) {
        ctx.save();
        const imageBlur = settings.background.image?.blur ?? 8;
        const grayscale = settings.background.image?.grayscale ?? false;
        ctx.filter = `${imageBlur > 0 ? `blur(${Math.max(1, imageBlur)}px) ` : ''}${
          grayscale ? 'grayscale(1)' : ''
        }`.trim();
        drawCoverImage(ctx, backgroundImg, size);
        ctx.restore();
        const opacity = (settings.background.image?.opacity ?? 60) / 100;
        ctx.fillStyle = settings.background.color;
        ctx.globalAlpha = Math.max(0, 1 - opacity);
        ctx.fillRect(0, 0, size, size);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = settings.background.color;
        ctx.fillRect(0, 0, size, size);
      }

      if (settings.source.mode === 'clipart') {
        const clipart =
          CLIPART_OPTIONS.find((option) => option.id === settings.source.clipart) ?? CLIPART_OPTIONS[0];
        const icon = new Path2D(clipart.svgPath);
        const viewBox = (clipart.viewBox ?? '0 0 24 24').split(' ').map(Number);
        const vbWidth = viewBox[2] || 24;
        const vbHeight = viewBox[3] || 24;
        const scale = Math.min(paddedSize / vbWidth, paddedSize / vbHeight);
        const dx = padding + (paddedSize - vbWidth * scale) / 2;
        const dy = padding + (paddedSize - vbHeight * scale) / 2;
        octx.save();
        octx.translate(dx, dy);
        octx.scale(scale, scale);
        octx.fillStyle = settings.source.color;
        octx.fill(icon);
        octx.restore();
      } else if (settings.source.mode === 'text') {
        octx.save();
        octx.fillStyle = settings.source.color;
        octx.font = `700 ${Math.round(paddedSize * 0.52)}px Arial, Helvetica, sans-serif`;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillText((settings.source.text || 'A').slice(0, 4).toUpperCase(), size / 2, size / 2);
        octx.restore();
      } else if (img) {
        drawContainImage(octx, img, padding, paddedSize);
      }

      if (settings.shape !== 'square') {
        octx.globalCompositeOperation = 'destination-in';
        octx.fillStyle = '#fff';
        fillShapePath(octx, size, padding, paddedSize, settings.shape, settings.borderRadius);
        octx.fill();
        octx.globalCompositeOperation = 'source-over';
      }

      if (settings.effect === 'shadow') {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(off, 0, 0);
        ctx.restore();
      }

      ctx.drawImage(off, 0, 0);

      if (settings.effect === 'gloss') {
        const gloss = ctx.createLinearGradient(0, 0, 0, size);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gloss.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
        ctx.save();
        if (settings.shape !== 'square') {
          fillShapePath(ctx, size, padding, paddedSize, settings.shape, settings.borderRadius);
          ctx.clip();
        }
        ctx.fillStyle = gloss;
        ctx.fillRect(padding, padding, paddedSize, paddedSize);
        ctx.restore();
      }

      drawBadge(ctx, size, settings);
    };

    render().catch(() => undefined);

    return () => {
      cancelled = true;
      revokedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [backgroundImage, uploadedImage, settings]);
  const platformLabel = getPlatformLabel(iconType);
  const hasRenderableSource = settings.source.mode !== 'image' || uploadedImage;
  const meta = [platformLabel, settings.shape, `${settings.padding}% padding`].join('  •  ');

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Preview</p>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        </div>
        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
          {settings.effect === 'none' ? 'clean' : settings.effect}
        </span>
      </div>
      <div className="rounded-[28px] border border-border bg-muted/30 p-3 sm:p-5">
        <div className="aspect-square w-full rounded-[24px] bg-[linear-gradient(45deg,rgba(148,163,184,0.12)_25%,transparent_25%,transparent_75%,rgba(148,163,184,0.12)_75%,rgba(148,163,184,0.12)),linear-gradient(45deg,rgba(148,163,184,0.12)_25%,transparent_25%,transparent_75%,rgba(148,163,184,0.12)_75%,rgba(148,163,184,0.12))] bg-[length:24px_24px] bg-[position:0_0,12px_12px] p-4 sm:p-8">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[20px] border border-border bg-card">
            {hasRenderableSource ? (
              <canvas ref={canvasRef} className="h-auto max-h-full w-full max-w-full object-contain" />
            ) : (
              <p className="px-6 text-center text-sm text-muted-foreground">
                Upload a source image
                <br />
                to render the export preview
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="rounded-2xl bg-muted/40 px-4 py-3">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">Platform</span>
          <span className="mt-1 block font-medium text-foreground">{platformLabel}</span>
        </div>
        <div className="rounded-2xl bg-muted/40 px-4 py-3">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">Shape</span>
          <span className="mt-1 block font-medium capitalize text-foreground">{settings.shape}</span>
        </div>
        <div className="rounded-2xl bg-muted/40 px-4 py-3">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">Padding</span>
          <span className="mt-1 block font-medium text-foreground">{settings.padding}%</span>
        </div>
      </div>
    </>
  );
};

export default IconPreview;
