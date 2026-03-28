'use client';

import React, { useEffect, useRef } from 'react';
import type { IconPreviewProps } from './types';

function drawScaledImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  padding: number,
  paddedSize: number,
  scaling: 'center' | 'crop',
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw === 0 || ih === 0) return;

  if (scaling === 'center') {
    const scale = Math.min(paddedSize / iw, paddedSize / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = padding + (paddedSize - dw) / 2;
    const dy = padding + (paddedSize - dh) / 2;
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
    return;
  }

  const scale = Math.max(paddedSize / iw, paddedSize / ih);
  const sw = paddedSize / scale;
  const sh = paddedSize / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, padding, padding, paddedSize, paddedSize);
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
  if (shape === 'squircle') {
    const r = paddedSize * 0.2;
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

const IconPreview: React.FC<IconPreviewProps> = ({ iconType, uploadedImage, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const objectUrl = URL.createObjectURL(uploadedImage);
    const img = new Image();

    img.onload = () => {
      const size = 512;
      canvas.width = size;
      canvas.height = size;

      const padding = settings.padding;
      const paddedSize = Math.max(1, size - padding * 2);
      const scaling = settings.scaling === 'crop' ? 'crop' : 'center';

      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');
      if (!octx) return;

      octx.clearRect(0, 0, size, size);
      drawScaledImage(octx, img, padding, paddedSize, scaling);

      if (settings.shape !== 'square') {
        octx.globalCompositeOperation = 'destination-in';
        octx.fillStyle = '#fff';
        fillShapePath(octx, size, padding, paddedSize, settings.shape);
        octx.fill();
        octx.globalCompositeOperation = 'source-over';
      }

      if (settings.background.transparent === true) {
        drawCheckerboard(ctx, size);
      } else {
        ctx.fillStyle = settings.background.color;
        ctx.fillRect(0, 0, size, size);
      }

      if (settings.effect === 'shadow') {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(off, 0, 0);
        ctx.restore();
      }

      ctx.drawImage(off, 0, 0);

      if (settings.effect === 'gloss') {
        const g = ctx.createLinearGradient(0, 0, 0, size);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
        ctx.save();
        if (settings.shape !== 'square') {
          fillShapePath(ctx, size, padding, paddedSize, settings.shape);
          ctx.clip();
        }
        ctx.fillStyle = g;
        ctx.fillRect(padding, padding, paddedSize, paddedSize);
        ctx.restore();
      }
    };

    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [uploadedImage, settings]);

  const platformLabel = iconType === 'android' ? 'Android' : iconType === 'ios' ? 'iOS' : 'Web';

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4">Preview</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
          {uploadedImage ? (
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
          ) : (
            <p className="text-center text-sm text-muted-foreground px-4">
              Upload an image
              <br />
              to see the preview
            </p>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-base font-medium text-foreground">{platformLabel}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Preview matches export: multiple sizes are generated for different screen densities.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Shape</dt>
              <dd className="text-foreground capitalize mt-0.5">{settings.shape}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Effect</dt>
              <dd className="text-foreground capitalize mt-0.5">{settings.effect}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Background</dt>
              <dd className="flex items-center gap-2 mt-0.5">
                {settings.background.transparent === true ? (
                  <span className="text-foreground text-xs">Transparent (alpha)</span>
                ) : (
                  <>
                    <span
                      className="inline-block size-4 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: settings.background.color }}
                    />
                    <span className="text-foreground font-mono text-xs">{settings.background.color}</span>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Padding</dt>
              <dd className="text-foreground mt-0.5">{settings.padding}px</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
};

export default IconPreview;
