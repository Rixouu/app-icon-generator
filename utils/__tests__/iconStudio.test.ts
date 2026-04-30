import {
  ANDROID_EXPORTS,
  BADGE_PRESETS,
  CLIPART_OPTIONS,
  DEFAULT_ICON_SETTINGS,
  IOS_EXPORTS,
  WEB_EXPORTS,
  getClipartPath,
  getClipartViewBox,
  getExportSummary,
  getPlatformLabel,
} from '../iconStudio';

describe('iconStudio', () => {
  it('returns stable platform labels', () => {
    expect(getPlatformLabel('android')).toBe('Android');
    expect(getPlatformLabel('ios')).toBe('iOS');
    expect(getPlatformLabel('web')).toBe('Web');
    expect(getPlatformLabel('all')).toBe('All Platforms');
  });

  it('returns a summary for each platform', () => {
    const android = getExportSummary('android');
    const ios = getExportSummary('ios');
    const web = getExportSummary('web');
    const all = getExportSummary('all');

    expect(android.title).toMatch(/launcher/i);
    expect(android.lines.length).toBeGreaterThan(0);
    expect(ios.title).toMatch(/appicon/i);
    expect(ios.lines.length).toBeGreaterThan(0);
    expect(web.title).toMatch(/favicon|pwa/i);
    expect(web.lines.length).toBeGreaterThan(0);
    expect(all.title).toMatch(/cross-platform/i);
    expect(all.lines.length).toBeGreaterThan(0);
  });

  it('keeps default settings within supported enums', () => {
    expect(['image', 'clipart', 'text']).toContain(DEFAULT_ICON_SETTINGS.source.mode);
    expect(['solid', 'gradient', 'mesh', 'image']).toContain(DEFAULT_ICON_SETTINGS.background.type);
    expect(['none', 'shadow', 'gloss']).toContain(DEFAULT_ICON_SETTINGS.effect);
    expect(['square', 'circle', 'squircle', 'rounded']).toContain(DEFAULT_ICON_SETTINGS.shape);
    expect(DEFAULT_ICON_SETTINGS.padding).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_ICON_SETTINGS.padding).toBeLessThanOrEqual(40);
  });

  it('export specs contain unique names', () => {
    const names = [
      ...ANDROID_EXPORTS.map((x) => x.name),
      ...IOS_EXPORTS.map((x) => x.name),
      ...WEB_EXPORTS.map((x) => x.name),
    ];
    expect(new Set(names).size).toBe(names.length);
  });

  it('badge presets are unique and consistent', () => {
    const ids = BADGE_PRESETS.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const preset of BADGE_PRESETS) {
      expect(preset.label).toBe(preset.text);
      expect(preset.color).toMatch(/^#/);
      expect(preset.textColor).toMatch(/^#/);
    }
  });

  it('clipart helpers return fallbacks for unknown ids', () => {
    expect(getClipartViewBox('unknown-id')).toBe('0 0 24 24');
    expect(getClipartPath('unknown-id')).toBe(CLIPART_OPTIONS[0].svgPath);
  });
});
