import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const BACKGROUND = '#07111C';

const OUT_DIR = path.join(process.cwd(), 'public');
const SOURCE = path.join(OUT_DIR, 'icon-app-icon-generator.png');

const ICONS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-icon.png', size: 180 },
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
];

const SPLASHES = [
  { file: 'splash-640x1136.png', width: 640, height: 1136 },
  { file: 'splash-750x1334.png', width: 750, height: 1334 },
  { file: 'splash-1125x2436.png', width: 1125, height: 2436 },
  { file: 'splash-1242x2688.png', width: 1242, height: 2688 },
  { file: 'splash-828x1792.png', width: 828, height: 1792 },
  { file: 'splash-1536x2048.png', width: 1536, height: 2048 },
  { file: 'splash-1668x2224.png', width: 1668, height: 2224 },
  { file: 'splash-2048x2732.png', width: 2048, height: 2732 },
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function iconScale(width, height) {
  const min = Math.min(width, height);
  return Math.max(180, Math.round(min * 0.28));
}

async function main() {
  if (!(await exists(SOURCE))) {
    throw new Error(`Missing source icon: ${SOURCE}`);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const base = sharp(SOURCE, { failOn: 'none' }).ensureAlpha();

  for (const { file, size } of ICONS) {
    await base
      .clone()
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(path.join(OUT_DIR, file));
  }

  try {
    await base.clone().resize(48, 48, { fit: 'contain' }).toFormat('ico').toFile(path.join(OUT_DIR, 'favicon.ico'));
  } catch {
    await base.clone().resize(48, 48, { fit: 'contain' }).png().toFile(path.join(OUT_DIR, 'favicon.ico'));
  }

  for (const { file, width, height } of SPLASHES) {
    const size = iconScale(width, height);
    const icon = await base.clone().resize(size, size, { fit: 'contain' }).png().toBuffer();
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BACKGROUND,
      },
    })
      .composite([{ input: icon, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT_DIR, file));
  }
}

await main();

