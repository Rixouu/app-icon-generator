export type PlatformType = 'android' | 'ios' | 'web' | 'all';
export type EffectType = 'none' | 'shadow' | 'gloss';
export type ShapeType = 'square' | 'circle' | 'squircle' | 'rounded';
export type SourceMode = 'image' | 'clipart' | 'text';
export type BackgroundType = 'solid' | 'gradient' | 'mesh' | 'image';
export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ClipartOption {
  id: string;
  label: string;
  category: string;
  svgPath: string;
  viewBox?: string;
}

export interface BadgePreset {
  id: string;
  label: string;
  text: string;
  color: string;
  textColor: string;
}

export interface IconSettingsType {
  source: {
    mode: SourceMode;
    clipart: string;
    text: string;
    color: string;
  };
  background: {
    color: string;
    transparent?: boolean;
    type: BackgroundType;
    gradient?: {
      colors: [string, string];
      angle: number;
    };
    mesh?: {
      colors: [string, string, string];
    };
    image?: {
      blur: number;
      opacity: number;
      grayscale: boolean;
    };
  };
  padding: number;
  shape: ShapeType;
  effect: EffectType;
  borderRadius?: number;
  badge: {
    enabled: boolean;
    text: string;
    color: string;
    textColor: string;
    position: BadgePosition;
  };
}

export interface GeneratedAsset {
  name: string;
  content: Buffer;
}

export interface ExportSpec {
  name: string;
  size: number;
}

export interface IosExportSpec extends ExportSpec {
  idiom: 'iphone' | 'ipad' | 'ios-marketing';
  scale: '1x' | '2x' | '3x';
  pointSize: string;
}

export const CLIPART_OPTIONS: ClipartOption[] = [
  {
    id: 'bolt',
    label: 'Bolt',
    category: 'Tech',
    viewBox: '0 0 24 24',
    svgPath:
      'M13 2 5 14h5l-1 8 8-12h-5l1-8Z',
  },
  {
    id: 'star',
    label: 'Star',
    category: 'Shapes',
    viewBox: '0 0 24 24',
    svgPath:
      'm12 2.5 2.97 6.03 6.65.97-4.81 4.69 1.14 6.62L12 17.7l-5.95 3.11 1.14-6.62L2.38 9.5l6.65-.97L12 2.5Z',
  },
  {
    id: 'heart',
    label: 'Heart',
    category: 'Shapes',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 21s-7.2-4.36-9.5-8.52C.87 9.42 2.1 5.5 6.24 4.4c2.34-.62 4.29.37 5.76 2.28 1.47-1.91 3.42-2.9 5.76-2.28 4.14 1.1 5.37 5.02 3.74 8.08C19.2 16.64 12 21 12 21Z',
  },
  {
    id: 'rocket',
    label: 'Rocket',
    category: 'Travel',
    viewBox: '0 0 24 24',
    svgPath:
      'M14.5 3.5c2.76.3 5.7 3.24 6 6-.39 2.8-1.75 5.28-4.07 7.42l-2.36 2.17-4.16-4.16 2.17-2.36C14.22 10.25 15.58 7.77 14.5 3.5ZM9.29 14.71l-2.5 2.5c-.5.5-1.37 1.43-1.79 2.79l-1 3 3-1c1.36-.42 2.29-1.29 2.79-1.79l2.5-2.5-3-3ZM15 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  },
  {
    id: 'leaf',
    label: 'Leaf',
    category: 'Nature',
    viewBox: '0 0 24 24',
    svgPath:
      'M19.5 3.5c-6.62.1-11.48 2.15-14.07 5.94-2.43 3.57-2.44 7.56-.03 11.06a.75.75 0 0 0 1.23.02c1.84-2.56 4.28-4.9 7.32-7.03-1.9 2.2-3.36 4.48-4.38 6.85a.75.75 0 0 0 1.33.68c2.07-3.16 4.88-5.9 8.42-8.22 2.55-1.67 3.18-5.22 1.39-7.87-.35-.52-.75-.98-1.21-1.43Z',
  },
  {
    id: 'flame',
    label: 'Flame',
    category: 'Nature',
    viewBox: '0 0 24 24',
    svgPath:
      'M12.02 2s2.88 3.23 2.88 6.27c0 1.48-.6 2.62-1.34 3.52 2.77-.58 5.94 1.53 5.94 5.04 0 3.54-2.84 5.99-7.48 5.99S4.5 20.25 4.5 16.76c0-4.88 3.72-7.03 5.4-9.55.88-1.32 1.2-2.55 1.2-5.21.3 0 .55.05.92 0Z',
  },
  {
    id: 'camera',
    label: 'Camera',
    category: 'Media',
    viewBox: '0 0 24 24',
    svgPath:
      'M7.5 5.5h2.1l1.04-1.56c.28-.42.75-.67 1.25-.67h.22c.5 0 .97.25 1.25.67L14.4 5.5h2.1A3.5 3.5 0 0 1 20 9v8a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 17V9a3.5 3.5 0 0 1 3.5-3.5Zm4.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-1.75a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z',
  },
  {
    id: 'gamepad',
    label: 'Gamepad',
    category: 'Games',
    viewBox: '0 0 24 24',
    svgPath:
      'M7.75 7.25h8.5c2.5 0 4.62 1.8 5.03 4.27l.42 2.5a4.5 4.5 0 0 1-6.63 4.74l-2.2-1.17a1.8 1.8 0 0 0-1.74 0l-2.2 1.17A4.5 4.5 0 0 1 2.3 14l.42-2.48A5.1 5.1 0 0 1 7.75 7.25Zm.25 3.25H6.5v1.5H5v1.5h1.5V15H8v-1.5h1.5V12H8v-1.5Zm8.25 1.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1.75 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  },
  {
    id: 'lock',
    label: 'Lock',
    category: 'Security',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 2.5A4.5 4.5 0 0 0 7.5 7v2H6A2.5 2.5 0 0 0 3.5 11.5v7A2.5 2.5 0 0 0 6 21h12a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 18 9h-1.5V7A4.5 4.5 0 0 0 12 2.5Zm-3 6.5V7a3 3 0 1 1 6 0v2H9Zm3 3a1.75 1.75 0 0 1 1 3.19V17a1 1 0 1 1-2 0v-1.81A1.75 1.75 0 0 1 12 12Z',
  },
  {
    id: 'globe',
    label: 'Globe',
    category: 'Travel',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm5.94 8.25h-3.08a13.6 13.6 0 0 0-1.24-5.02 7.54 7.54 0 0 1 4.32 5.02ZM12 4.54c.8 1.07 1.47 3.07 1.71 5.21h-3.42C10.53 7.61 11.2 5.61 12 4.54ZM8.38 6.23a13.6 13.6 0 0 0-1.24 5.02H4.06a7.54 7.54 0 0 1 4.32-5.02ZM4.06 12.75h3.08c.12 1.74.56 3.47 1.24 5.02a7.54 7.54 0 0 1-4.32-5.02ZM12 19.46c-.8-1.07-1.47-3.07-1.71-5.21h3.42c-.24 2.14-.91 4.14-1.71 5.21Zm1.62-1.69a13.6 13.6 0 0 0 1.24-5.02h3.08a7.54 7.54 0 0 1-4.32 5.02Z',
  },
  {
    id: 'sparkles',
    label: 'Sparkles',
    category: 'Tech',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 2.5 13.9 8l5.6 1.9-5.6 1.9-1.9 5.7-1.9-5.7L4.5 9.9 10.1 8 12 2.5Zm6 10 1 2.8 2.8 1-2.8 1-1 2.7-1-2.7-2.8-1 2.8-1 1-2.8Zm-11 1 1 2.2 2.2 1L8 17.7 7 20l-1-2.3-2.2-1 2.2-1L7 13.5Z',
  },
  {
    id: 'cloud',
    label: 'Cloud',
    category: 'Tech',
    viewBox: '0 0 24 24',
    svgPath:
      'M8 19.5a5 5 0 0 1-.78-9.94A6 6 0 0 1 18.8 8a4.25 4.25 0 1 1 .2 8.5H8Z',
  },
  {
    id: 'shield',
    label: 'Shield',
    category: 'Security',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 2.8 19 5.4v5.1c0 4.6-2.7 8.8-7 10.7-4.3-1.9-7-6.1-7-10.7V5.4l7-2.6Z',
  },
  {
    id: 'bag',
    label: 'Bag',
    category: 'Commerce',
    viewBox: '0 0 24 24',
    svgPath:
      'M7 7.5V7a5 5 0 0 1 10 0v.5h1.5A1.5 1.5 0 0 1 20 9l-.8 10.2A2 2 0 0 1 17.2 21H6.8a2 2 0 0 1-1.99-1.8L4 9a1.5 1.5 0 0 1 1.5-1.5H7Zm2 0h6V7a3 3 0 1 0-6 0v.5Z',
  },
  {
    id: 'chart',
    label: 'Chart',
    category: 'Commerce',
    viewBox: '0 0 24 24',
    svgPath:
      'M5 19.5h14v1.5H3.5V5H5v14.5Zm2-2.5V11h2v6H7Zm4 0V7h2v10h-2Zm4 0v-4h2v4h-2Z',
  },
  {
    id: 'music',
    label: 'Music',
    category: 'Media',
    viewBox: '0 0 24 24',
    svgPath:
      'M15.5 4.5v10.1A3.4 3.4 0 1 1 14 12V6.2l6-1.2v8.1A3.4 3.4 0 1 1 18.5 11V4.5l-3 .6Z',
  },
  {
    id: 'video',
    label: 'Video',
    category: 'Media',
    viewBox: '0 0 24 24',
    svgPath:
      'M5.5 6.5h9A2.5 2.5 0 0 1 17 9v1.2l3.7-2A.8.8 0 0 1 22 8.9v6.2a.8.8 0 0 1-1.3.67l-3.7-2V15a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 15V9a2.5 2.5 0 0 1 2.5-2.5Z',
  },
  {
    id: 'paw',
    label: 'Paw',
    category: 'Nature',
    viewBox: '0 0 24 24',
    svgPath:
      'M7.2 10.1a1.9 2.5 0 1 0 0-5 1.9 2.5 0 0 0 0 5Zm9.6 0a1.9 2.5 0 1 0 0-5 1.9 2.5 0 0 0 0 5ZM11 8.2a2 2.8 0 1 0 0-5.6 2 2.8 0 0 0 0 5.6Zm-2.5 12.3c-2.1 0-3.8-1.5-3.8-3.4 0-2.4 2.3-5 5.3-5 .9 0 1.7.2 2.5.7.7-.5 1.5-.7 2.4-.7 3 0 5.4 2.6 5.4 5 0 1.9-1.7 3.4-3.8 3.4-1.4 0-2.7-.6-4-1.8-1.2 1.2-2.6 1.8-4 1.8Z',
  },
  {
    id: 'sun',
    label: 'Sun',
    category: 'Nature',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0-4 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Zm0 14.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5ZM2.5 12l2.5-1 1-2.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1Zm14.5 0 2.5-1 1-2.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1Z',
  },
  {
    id: 'chat',
    label: 'Chat',
    category: 'Social',
    viewBox: '0 0 24 24',
    svgPath:
      'M6 5h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H10l-4.5 3V17A3 3 0 0 1 3 14V8a3 3 0 0 1 3-3Z',
  },
  {
    id: 'people',
    label: 'People',
    category: 'Social',
    viewBox: '0 0 24 24',
    svgPath:
      'M9 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 0a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 11ZM4 18.5a5 5 0 0 1 10 0V20H4v-1.5Zm11 1.5v-1a4.4 4.4 0 0 0-1-2.8c2.7.1 5 1.4 6 3.8h-5Z',
  },
  {
    id: 'map',
    label: 'Map',
    category: 'Travel',
    viewBox: '0 0 24 24',
    svgPath:
      'M15.5 4 9 6.2 3.8 4.5A.6.6 0 0 0 3 5.1v14.3c0 .26.17.5.42.57L9 21.8 15 19.8l5.2 1.72a.6.6 0 0 0 .8-.57V6.6a.6.6 0 0 0-.42-.57L15.5 4Zm-1 1.8v12.4L9.5 19.7V7.3l5-1.5Z',
  },
  {
    id: 'compass',
    label: 'Compass',
    category: 'Travel',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 3.5A8.5 8.5 0 1 0 20.5 12 8.5 8.5 0 0 0 12 3.5Zm3.7 4.8-2 6-6 2 2-6 6-2Z',
  },
  {
    id: 'cpu',
    label: 'CPU',
    category: 'Tech',
    viewBox: '0 0 24 24',
    svgPath:
      'M9 4V2.5h1.5V4h3V2.5H15V4h1.5A2.5 2.5 0 0 1 19 6.5V8h1.5v1.5H19v3h1.5V14H19v1.5A2.5 2.5 0 0 1 16.5 18H15v1.5h-1.5V18h-3v1.5H9V18H7.5A2.5 2.5 0 0 1 5 15.5V14H3.5v-1.5H5v-3H3.5V8H5V6.5A2.5 2.5 0 0 1 7.5 4H9Zm-1.5 3.5v9h9v-9h-9Zm2 2h5v5h-5v-5Z',
  },
  {
    id: 'bell',
    label: 'Bell',
    category: 'Social',
    viewBox: '0 0 24 24',
    svgPath:
      'M12 3.5a4 4 0 0 1 4 4V9c0 1.9.8 3.7 2.1 5l.4.4c.6.6.18 1.6-.67 1.6H6.12c-.85 0-1.27-1-.67-1.6l.4-.4A7.1 7.1 0 0 0 8 9V7.5a4 4 0 0 1 4-4Zm0 17.5a2.5 2.5 0 0 1-2.45-2h4.9A2.5 2.5 0 0 1 12 21Z',
  },
];

export const BADGE_PRESETS: BadgePreset[] = [
  { id: 'new', label: 'NEW', text: 'NEW', color: '#111827', textColor: '#ffffff' },
  { id: 'beta', label: 'BETA', text: 'BETA', color: '#2563eb', textColor: '#ffffff' },
  { id: 'pro', label: 'PRO', text: 'PRO', color: '#7c3aed', textColor: '#ffffff' },
  { id: 'ai', label: 'AI', text: 'AI', color: '#059669', textColor: '#ffffff' },
];

export const DEFAULT_ICON_SETTINGS: IconSettingsType = {
  source: {
    mode: 'image',
    clipart: 'bolt',
    text: 'AI',
    color: '#ffffff',
  },
  effect: 'none',
  padding: 15,
  background: {
    color: '#7044ff',
    type: 'solid',
    transparent: false,
    gradient: {
      colors: ['#7044ff', '#9c7bff'],
      angle: 135,
    },
    mesh: {
      colors: ['#7044ff', '#9c7bff', '#2dd4bf'],
    },
    image: {
      blur: 8,
      opacity: 60,
      grayscale: false,
    },
  },
  shape: 'squircle',
  borderRadius: 24,
  badge: {
    enabled: false,
    text: 'NEW',
    color: '#111827',
    textColor: '#ffffff',
    position: 'top-right',
  },
};

export const ANDROID_EXPORTS: ExportSpec[] = [
  { name: 'play_store_512.png', size: 512 },
  { name: 'res/mipmap-mdpi/ic_launcher.png', size: 48 },
  { name: 'res/mipmap-hdpi/ic_launcher.png', size: 72 },
  { name: 'res/mipmap-xhdpi/ic_launcher.png', size: 96 },
  { name: 'res/mipmap-xxhdpi/ic_launcher.png', size: 144 },
  { name: 'res/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
];

export const IOS_EXPORTS: IosExportSpec[] = [
  { name: 'AppIcon-20@2x.png', size: 40, idiom: 'iphone', scale: '2x', pointSize: '20x20' },
  { name: 'AppIcon-20@3x.png', size: 60, idiom: 'iphone', scale: '3x', pointSize: '20x20' },
  { name: 'AppIcon-29@2x.png', size: 58, idiom: 'iphone', scale: '2x', pointSize: '29x29' },
  { name: 'AppIcon-29@3x.png', size: 87, idiom: 'iphone', scale: '3x', pointSize: '29x29' },
  { name: 'AppIcon-40@2x.png', size: 80, idiom: 'iphone', scale: '2x', pointSize: '40x40' },
  { name: 'AppIcon-40@3x.png', size: 120, idiom: 'iphone', scale: '3x', pointSize: '40x40' },
  { name: 'AppIcon-60@2x.png', size: 120, idiom: 'iphone', scale: '2x', pointSize: '60x60' },
  { name: 'AppIcon-60@3x.png', size: 180, idiom: 'iphone', scale: '3x', pointSize: '60x60' },
  { name: 'AppIcon-20-ipad.png', size: 20, idiom: 'ipad', scale: '1x', pointSize: '20x20' },
  { name: 'AppIcon-20@2x-ipad.png', size: 40, idiom: 'ipad', scale: '2x', pointSize: '20x20' },
  { name: 'AppIcon-29-ipad.png', size: 29, idiom: 'ipad', scale: '1x', pointSize: '29x29' },
  { name: 'AppIcon-29@2x-ipad.png', size: 58, idiom: 'ipad', scale: '2x', pointSize: '29x29' },
  { name: 'AppIcon-40-ipad.png', size: 40, idiom: 'ipad', scale: '1x', pointSize: '40x40' },
  { name: 'AppIcon-40@2x-ipad.png', size: 80, idiom: 'ipad', scale: '2x', pointSize: '40x40' },
  { name: 'AppIcon-76-ipad.png', size: 76, idiom: 'ipad', scale: '1x', pointSize: '76x76' },
  { name: 'AppIcon-76@2x-ipad.png', size: 152, idiom: 'ipad', scale: '2x', pointSize: '76x76' },
  { name: 'AppIcon-83.5@2x-ipad.png', size: 167, idiom: 'ipad', scale: '2x', pointSize: '83.5x83.5' },
  { name: 'AppIcon-ios-marketing.png', size: 1024, idiom: 'ios-marketing', scale: '1x', pointSize: '1024x1024' },
];

export const WEB_EXPORTS: ExportSpec[] = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-192-maskable.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512 },
];

export function getClipartPath(clipartId: string): string {
  return CLIPART_OPTIONS.find((item) => item.id === clipartId)?.svgPath ?? CLIPART_OPTIONS[0].svgPath;
}

export function getClipartViewBox(clipartId: string): string {
  return CLIPART_OPTIONS.find((item) => item.id === clipartId)?.viewBox ?? '0 0 24 24';
}

export function getPlatformLabel(platform: PlatformType): string {
  if (platform === 'android') return 'Android';
  if (platform === 'ios') return 'iOS';
  if (platform === 'all') return 'All Platforms';
  return 'Web';
}

export function getExportSummary(platform: PlatformType): { title: string; lines: string[] } {
  if (platform === 'android') {
    return {
      title: 'Adaptive launcher pack',
      lines: [
        'Play Store 512 icon',
        'mipmap-mdpi to xxxhdpi launcher PNGs',
        'Adaptive foreground, background, monochrome, and XML',
      ],
    };
  }

  if (platform === 'ios') {
    return {
      title: 'AppIcon.appiconset pack',
      lines: [
        'iPhone and iPad AppIcon PNG sizes',
        '1024x1024 App Store marketing icon',
        'Xcode-ready Contents.json metadata',
      ],
    };
  }

  if (platform === 'all') {
    return {
      title: 'Full cross-platform pack',
      lines: [
        'Android adaptive launcher assets',
        'iOS AppIcon.appiconset with Contents.json',
        'Web favicons, Apple touch icon, and maskable PWA icons',
      ],
    };
  }

  return {
    title: 'PWA and favicon pack',
    lines: [
      'Favicon PNGs plus favicon.ico',
      'Apple touch icon',
      'Standard and maskable 192 / 512 web icons',
    ],
  };
}
