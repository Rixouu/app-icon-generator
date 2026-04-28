import sharp from 'sharp';
import {
  ANDROID_EXPORTS,
  IOS_EXPORTS,
  WEB_EXPORTS,
  getClipartPath,
  getClipartViewBox,
  type BadgePosition,
  type GeneratedAsset,
  type IconSettingsType,
  type PlatformType,
  type ShapeType,
} from './iconStudio';

const ANDROID_BASE_NAME = 'ic_launcher';

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

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getMaskSvg(size: number, shape: ShapeType, borderRadius = 24): string | null {
  if (shape === 'square') return null;
  if (shape === 'circle') {
    const c = size / 2;
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${c}" cy="${c}" r="${c}" fill="white"/></svg>`;
  }

  const radius = shape === 'rounded' ? clamp((borderRadius / 100) * size, 8, size / 2) : size * 0.22;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`;
}

function createGradientSvg(size: number, settings: IconSettingsType): Buffer {
  const gradient = settings.background.gradient ?? {
    colors: [settings.background.color, settings.background.color] as [string, string],
    angle: 135,
  };

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${size}" y2="0" gradientTransform="rotate(${gradient.angle} ${size / 2} ${size / 2})">
          <stop offset="0%" stop-color="${gradient.colors[0]}"/>
          <stop offset="100%" stop-color="${gradient.colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
    </svg>`,
  );
}

function createMeshSvg(size: number, settings: IconSettingsType): Buffer {
  const mesh = settings.background.mesh ?? {
    colors: [settings.background.color, '#9c7bff', '#2dd4bf'] as [string, string, string],
  };

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g1" cx="22%" cy="20%" r="70%">
          <stop offset="0%" stop-color="${mesh.colors[0]}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${mesh.colors[0]}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="78%" cy="24%" r="72%">
          <stop offset="0%" stop-color="${mesh.colors[1]}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${mesh.colors[1]}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g3" cx="52%" cy="82%" r="74%">
          <stop offset="0%" stop-color="${mesh.colors[2]}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${mesh.colors[2]}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="${settings.background.color}"/>
      <rect width="${size}" height="${size}" fill="url(#g1)"/>
      <rect width="${size}" height="${size}" fill="url(#g2)"/>
      <rect width="${size}" height="${size}" fill="url(#g3)"/>
    </svg>`,
  );
}

async function buildImageBackground(
  size: number,
  backgroundBuffer: Buffer | null,
  settings: IconSettingsType,
): Promise<Buffer> {
  if (!backgroundBuffer) {
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { ...hexToRgb(settings.background.color), alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  const imageSettings = settings.background.image ?? { blur: 8, opacity: 60, grayscale: false };
  let pipeline = sharp(backgroundBuffer)
    .rotate()
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .ensureAlpha();

  if (imageSettings.blur > 0) {
    pipeline = pipeline.blur(Math.max(0.3, imageSettings.blur / 4));
  }

  if (imageSettings.grayscale) {
    pipeline = pipeline.grayscale();
  }

  const opacity = clamp(imageSettings.opacity, 0, 100) / 100;
  if (opacity < 1) {
    pipeline = pipeline.modulate({ brightness: Math.max(0.25, opacity) });
  }

  const imageBuffer = await pipeline.png().toBuffer();
  const solidOverlay = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...hexToRgb(settings.background.color), alpha: clamp(1 - opacity, 0, 1) },
    },
  })
    .png()
    .toBuffer();

  return sharp(imageBuffer).composite([{ input: solidOverlay, blend: 'over' }]).png().toBuffer();
}

async function buildBackground(
  size: number,
  settings: IconSettingsType,
  backgroundBuffer: Buffer | null,
): Promise<Buffer> {
  if (settings.background.transparent === true) {
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
  }

  if (settings.background.type === 'gradient') {
    return sharp(createGradientSvg(size, settings)).png().toBuffer();
  }

  if (settings.background.type === 'mesh') {
    return sharp(createMeshSvg(size, settings)).png().toBuffer();
  }

  if (settings.background.type === 'image') {
    return buildImageBackground(size, backgroundBuffer, settings);
  }

  const bg = hexToRgb(settings.background.color);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...bg, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

async function buildSourceLayer(
  sourceBuffer: Buffer | null,
  innerSize: number,
  settings: IconSettingsType,
  overrides?: Partial<IconSettingsType['source']>,
): Promise<Buffer> {
  const source = { ...settings.source, ...overrides };

  if (source.mode === 'clipart') {
    const svg = `<svg width="${innerSize}" height="${innerSize}" viewBox="${getClipartViewBox(source.clipart)}" xmlns="http://www.w3.org/2000/svg">
      <path d="${getClipartPath(source.clipart)}" fill="${source.color}"/>
    </svg>`;
    return sharp(Buffer.from(svg)).resize(innerSize, innerSize, { fit: 'contain' }).png().toBuffer();
  }

  if (source.mode === 'text') {
    const fontSize = clamp(Math.round(innerSize * 0.52), 28, Math.round(innerSize * 0.72));
    const text = escapeXml((source.text || 'A').slice(0, 4).toUpperCase());
    const svg = `<svg width="${innerSize}" height="${innerSize}" viewBox="0 0 ${innerSize} ${innerSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${innerSize}" height="${innerSize}" fill="transparent"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="${source.color}" letter-spacing="-0.04em">${text}</text>
    </svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
  }

  if (!sourceBuffer) {
    throw new Error('An uploaded image is required when source mode is set to image.');
  }

  return sharp(sourceBuffer)
    .rotate()
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function applyShapeMask(
  sourcePng: Buffer,
  size: number,
  shape: ShapeType,
  borderRadius?: number,
): Promise<Buffer> {
  const maskSvg = getMaskSvg(size, shape, borderRadius);
  if (!maskSvg) return sourcePng;

  return sharp(sourcePng)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function applyGloss(
  corePng: Buffer,
  innerSize: number,
  shape: ShapeType,
  borderRadius?: number,
): Promise<Buffer> {
  const mask = getMaskSvg(innerSize, shape, borderRadius);
  const shapeMarkup = mask
    ? mask.replace('fill="white"', 'fill="url(#gloss)"')
    : `<rect width="${innerSize}" height="${innerSize}" fill="url(#gloss)"/>`;
  const innerMarkup = shapeMarkup.includes('<svg')
    ? shapeMarkup.slice(shapeMarkup.indexOf('>') + 1, shapeMarkup.lastIndexOf('</svg>'))
    : shapeMarkup;
  const gloss = Buffer.from(
    `<svg width="${innerSize}" height="${innerSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="white" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="white" stop-opacity="0.08"/>
          <stop offset="50%" stop-color="white" stop-opacity="0"/>
          <stop offset="100%" stop-color="white" stop-opacity="0.08"/>
        </linearGradient>
      </defs>
      ${innerMarkup}
    </svg>`,
  );

  return sharp(corePng).composite([{ input: gloss, blend: 'over' }]).png().toBuffer();
}

async function applyShadowInPlace(corePng: Buffer, innerSize: number): Promise<Buffer> {
  const shadow = await sharp(corePng).ensureAlpha().greyscale().blur(10).linear(0.25, 0).png().toBuffer();

  return sharp({
    create: {
      width: innerSize,
      height: innerSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: shadow,
        left: Math.max(2, Math.round(innerSize * 0.03)),
        top: Math.max(4, Math.round(innerSize * 0.05)),
        blend: 'over',
      },
      { input: corePng, left: 0, top: 0, blend: 'over' },
    ])
    .png()
    .toBuffer();
}

function getBadgeAnchor(size: number, badgeSize: number, position: BadgePosition): { x: number; y: number } {
  const inset = Math.round(size * 0.04);
  const max = size - badgeSize - inset;

  if (position === 'top-left') return { x: inset, y: inset };
  if (position === 'bottom-left') return { x: inset, y: max };
  if (position === 'bottom-right') return { x: max, y: max };
  return { x: max, y: inset };
}

async function applyBadge(
  imageBuffer: Buffer,
  size: number,
  settings: IconSettingsType,
  monochrome: boolean,
): Promise<Buffer> {
  if (!settings.badge.enabled) return imageBuffer;

  const badgeSize = Math.round(size * 0.28);
  const { x, y } = getBadgeAnchor(size, badgeSize, settings.badge.position);
  const radius = Math.round(badgeSize * 0.34);
  const fill = monochrome ? '#ffffff' : settings.badge.color;
  const textColor = monochrome ? '#000000' : settings.badge.textColor;
  const badgeText = escapeXml((settings.badge.text || 'NEW').slice(0, 4).toUpperCase());
  const fontSize = Math.max(12, Math.round(badgeSize * 0.28));
  const badgeSvg = Buffer.from(
    `<svg width="${badgeSize}" height="${badgeSize}" viewBox="0 0 ${badgeSize} ${badgeSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${badgeSize}" height="${badgeSize}" rx="${radius}" ry="${radius}" fill="${fill}"/>
      <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="${textColor}" letter-spacing="-0.02em">${badgeText}</text>
    </svg>`,
  );

  return sharp(imageBuffer).composite([{ input: badgeSvg, left: x, top: y, blend: 'over' }]).png().toBuffer();
}

async function composeIcon(
  size: number,
  settings: IconSettingsType,
  sourceBuffer: Buffer | null,
  backgroundBuffer: Buffer | null,
  options?: {
    maskable?: boolean;
    foregroundOnly?: boolean;
    monochrome?: boolean;
    backgroundOnly?: boolean;
  },
): Promise<Buffer> {
  const paddingRatio = (options?.maskable ? Math.min(settings.padding, 10) : settings.padding) / 100;
  const paddingPx = clamp(Math.round(size * paddingRatio), 0, Math.floor(size * 0.35));
  const innerSize = Math.max(1, size - paddingPx * 2);

  if (options?.backgroundOnly) {
    return buildBackground(size, settings, backgroundBuffer);
  }

  let core = await buildSourceLayer(
    sourceBuffer,
    innerSize,
    settings,
    options?.monochrome ? { color: '#ffffff' } : undefined,
  );
  core = await applyShapeMask(core, innerSize, settings.shape, settings.borderRadius);

  if (settings.effect === 'shadow' && !options?.foregroundOnly && !options?.monochrome) {
    core = await applyShadowInPlace(core, innerSize);
  }

  if (settings.effect === 'gloss' && !options?.foregroundOnly && !options?.monochrome) {
    core = await applyGloss(core, innerSize, settings.shape, settings.borderRadius);
  }

  const base = options?.foregroundOnly || options?.monochrome
    ? sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
    : sharp(await buildBackground(size, settings, backgroundBuffer));

  let result = await base
    .composite([{ input: core, left: paddingPx, top: paddingPx, blend: 'over' }])
    .png()
    .toBuffer();

  if (!options?.backgroundOnly && !options?.monochrome) {
    result = await applyBadge(result, size, settings, false);
  }

  return result;
}

async function buildAndroidPack(
  sourceBuffer: Buffer | null,
  backgroundBuffer: Buffer | null,
  settings: IconSettingsType,
): Promise<GeneratedAsset[]> {
  const assets: GeneratedAsset[] = [];

  for (const spec of ANDROID_EXPORTS) {
    assets.push({
      name: `android/${spec.name}`,
      content: await composeIcon(spec.size, settings, sourceBuffer, backgroundBuffer),
    });
  }

  const densities = [
    ['mdpi', 108],
    ['hdpi', 162],
    ['xhdpi', 216],
    ['xxhdpi', 324],
    ['xxxhdpi', 432],
  ] as const;

  for (const [density, size] of densities) {
    assets.push({
      name: `android/res/mipmap-${density}/${ANDROID_BASE_NAME}_foreground.png`,
      content: await composeIcon(size, settings, sourceBuffer, backgroundBuffer, { foregroundOnly: true }),
    });
    assets.push({
      name: `android/res/mipmap-${density}/${ANDROID_BASE_NAME}_background.png`,
      content: await composeIcon(size, settings, sourceBuffer, backgroundBuffer, { backgroundOnly: true }),
    });
    assets.push({
      name: `android/res/mipmap-${density}/${ANDROID_BASE_NAME}_monochrome.png`,
      content: await composeIcon(size, settings, sourceBuffer, backgroundBuffer, {
        foregroundOnly: true,
        monochrome: true,
      }),
    });
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@mipmap/${ANDROID_BASE_NAME}_background" />
  <foreground android:drawable="@mipmap/${ANDROID_BASE_NAME}_foreground" />
  <monochrome android:drawable="@mipmap/${ANDROID_BASE_NAME}_monochrome" />
</adaptive-icon>
`;

  assets.push({
    name: `android/res/mipmap-anydpi-v26/${ANDROID_BASE_NAME}.xml`,
    content: Buffer.from(xml),
  });

  return assets;
}

function buildIosContentsJson(): Buffer {
  return Buffer.from(
    JSON.stringify(
      {
        images: IOS_EXPORTS.map((spec) => ({
          size: spec.pointSize,
          idiom: spec.idiom,
          filename: spec.name,
          scale: spec.scale,
        })),
        info: {
          version: 1,
          author: 'xcode',
        },
      },
      null,
      2,
    ),
  );
}

async function buildIosPack(
  sourceBuffer: Buffer | null,
  backgroundBuffer: Buffer | null,
  settings: IconSettingsType,
): Promise<GeneratedAsset[]> {
  const assets: GeneratedAsset[] = [];
  for (const spec of IOS_EXPORTS) {
    assets.push({
      name: `ios/${spec.name}`,
      content: await composeIcon(spec.size, settings, sourceBuffer, backgroundBuffer),
    });
  }

  assets.push({ name: 'ios/Contents.json', content: buildIosContentsJson() });
  return assets;
}

function buildIcoFromPng(pngBuffer: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const directory = Buffer.alloc(16);
  directory.writeUInt8(size >= 256 ? 0 : size, 0);
  directory.writeUInt8(size >= 256 ? 0 : size, 1);
  directory.writeUInt8(0, 2);
  directory.writeUInt8(0, 3);
  directory.writeUInt16LE(1, 4);
  directory.writeUInt16LE(32, 6);
  directory.writeUInt32LE(pngBuffer.length, 8);
  directory.writeUInt32LE(header.length + directory.length, 12);

  return Buffer.from(new Uint8Array([...header, ...directory, ...pngBuffer]));
}

async function buildWebPack(
  sourceBuffer: Buffer | null,
  backgroundBuffer: Buffer | null,
  settings: IconSettingsType,
): Promise<GeneratedAsset[]> {
  const assets: GeneratedAsset[] = [];
  for (const spec of WEB_EXPORTS) {
    const isMaskable = spec.name.includes('maskable');
    assets.push({
      name: `web/${spec.name}`,
      content: await composeIcon(spec.size, settings, sourceBuffer, backgroundBuffer, {
        maskable: isMaskable,
      }),
    });
  }

  const faviconSource = await composeIcon(48, settings, sourceBuffer, backgroundBuffer);
  assets.push({
    name: 'web/favicon.ico',
    content: buildIcoFromPng(faviconSource, 48),
  });
  return assets;
}

export async function generateIcons(
  sourceBuffer: Buffer | null,
  backgroundBuffer: Buffer | null,
  settings: IconSettingsType,
  iconType: PlatformType,
): Promise<GeneratedAsset[]> {
  if (settings.source.mode === 'image' && !sourceBuffer) {
    throw new Error('Upload a source image or switch the icon source to clipart or text.');
  }

  if (settings.background.type === 'image' && !backgroundBuffer) {
    throw new Error('Upload a background image to use the image background mode.');
  }

  if (iconType === 'android') {
    return buildAndroidPack(sourceBuffer, backgroundBuffer, settings);
  }

  if (iconType === 'ios') {
    return buildIosPack(sourceBuffer, backgroundBuffer, settings);
  }

  if (iconType === 'web') {
    return buildWebPack(sourceBuffer, backgroundBuffer, settings);
  }

  const [android, ios, web] = await Promise.all([
    buildAndroidPack(sourceBuffer, backgroundBuffer, settings),
    buildIosPack(sourceBuffer, backgroundBuffer, settings),
    buildWebPack(sourceBuffer, backgroundBuffer, settings),
  ]);

  return [...android, ...ios, ...web];
}
