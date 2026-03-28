import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import type { IconSettingsType } from '../app/components/types';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

async function buildMaskedCore(
  filePath: string,
  innerSize: number,
  scaling: 'center' | 'crop',
  shape: 'square' | 'circle' | 'squircle',
): Promise<Buffer> {
  const resizeOpts =
    scaling === 'crop'
      ? { fit: 'cover' as const, position: 'centre' as const }
      : {
          fit: 'contain' as const,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        };

  let pipeline = sharp(filePath)
    .rotate()
    .resize(innerSize, innerSize, resizeOpts)
    .ensureAlpha();

  if (shape === 'square') {
    return pipeline.png().toBuffer();
  }

  const buf = await pipeline.png().toBuffer();
  let maskSvg: string;
  if (shape === 'circle') {
    const c = innerSize / 2;
    const r = innerSize / 2;
    maskSvg = `<svg width="${innerSize}" height="${innerSize}"><circle cx="${c}" cy="${c}" r="${r}" fill="white"/></svg>`;
  } else {
    const r = innerSize * 0.2;
    maskSvg = `<svg width="${innerSize}" height="${innerSize}"><rect x="0" y="0" width="${innerSize}" height="${innerSize}" rx="${r}" ry="${r}" fill="white"/></svg>`;
  }

  return sharp(buf)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function applyGloss(corePng: Buffer, innerSize: number): Promise<Buffer> {
  const gloss = Buffer.from(
    `<svg width="${innerSize}" height="${innerSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.35"/>
          <stop offset="50%" style="stop-color:white;stop-opacity:0.08"/>
          <stop offset="50%" style="stop-color:white;stop-opacity:0"/>
          <stop offset="100%" style="stop-color:white;stop-opacity:0.08"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${innerSize}" height="${innerSize}" fill="url(#gloss)"/>
    </svg>`,
  );
  return sharp(corePng)
    .composite([{ input: gloss, blend: 'over' }])
    .png()
    .toBuffer();
}

async function applyShadowInPlace(corePng: Buffer, innerSize: number): Promise<Buffer> {
  const shadow = await sharp(corePng)
    .ensureAlpha()
    .greyscale()
    .blur(8)
    .linear(0.22, 0)
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: innerSize,
      height: innerSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadow, left: 4, top: 6, blend: 'over' },
      { input: corePng, left: 0, top: 0, blend: 'over' },
    ])
    .png()
    .toBuffer();
}

export async function generateIcons(
  filePath: string,
  settings: IconSettingsType & { iconType: string },
) {
  await fs.access(filePath);

  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });

  const sizes =
    settings.iconType === 'android'
      ? [36, 48, 72, 96, 144, 192]
      : [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180];

  const scaling = settings.scaling === 'crop' ? 'crop' : 'center';
  const shape =
    settings.shape === 'circle' || settings.shape === 'squircle' ? settings.shape : 'square';

  const icons: { path: string; name: string }[] = [];
  const bgTransparent = settings.background.transparent === true;
  const bg = hexToRgb(settings.background.color);

  for (const size of sizes) {
    const outputPath = path.join(tempDir, `icon_${size}.png`);
    const innerSize = Math.max(1, size - settings.padding * 2);

    try {
      let core = await buildMaskedCore(filePath, innerSize, scaling, shape);

      if (settings.effect === 'shadow') {
        core = await applyShadowInPlace(core, innerSize);
      }

      if (settings.effect === 'gloss') {
        core = await applyGloss(core, innerSize);
      }

      const padded = sharp(core).extend({
        top: settings.padding,
        bottom: settings.padding,
        left: settings.padding,
        right: settings.padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });

      if (bgTransparent) {
        await padded.png().toFile(outputPath);
      } else {
        await padded.flatten({ background: { ...bg, alpha: 1 } }).png().toFile(outputPath);
      }

      icons.push({ path: outputPath, name: `icon_${size}.png` });
    } catch {
      // Skip this size; continue with others
    }
  }

  return icons;
}
