import React from 'react';
import DownloadButton from './DownloadButton';
import {
  ANDROID_EXPORTS,
  IOS_EXPORTS,
  WEB_EXPORTS,
  getExportSummary,
  getPlatformLabel,
  type PlatformType,
} from '@/utils/iconStudio';

interface DownloadSectionProps {
  onDownload: () => void;
  disabled: boolean;
  iconType: PlatformType;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onDownload, disabled, iconType }) => {
  const iconSizes =
    iconType === 'android'
      ? [...new Set(ANDROID_EXPORTS.map((item) => item.size))]
      : iconType === 'ios'
        ? [...new Set(IOS_EXPORTS.map((item) => item.size))]
        : iconType === 'all'
          ? [
              ...new Set([
                ...ANDROID_EXPORTS.map((item) => item.size),
                ...IOS_EXPORTS.map((item) => item.size),
                ...WEB_EXPORTS.map((item) => item.size),
              ]),
            ]
          : [...new Set(WEB_EXPORTS.map((item) => item.size))];
  const summary = getExportSummary(iconType);
  const platform = getPlatformLabel(iconType);

  return (
    <>
      <h2 className="mb-2 text-sm font-medium text-foreground">Export</h2>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        One ZIP with a production-ready {platform} asset pack and platform-specific filenames.
      </p>
      <div className="mb-4 rounded-2xl border border-border bg-muted p-3">
        <p className="text-xs font-medium text-foreground">{summary.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {summary.lines.map((line) => (
            <span
              key={line}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground"
            >
              {line}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Sizes (px)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {iconSizes.map((size) => (
            <span
              key={size}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground"
            >
              {size}×{size}
            </span>
          ))}
        </div>
      </div>
      <DownloadButton onDownload={onDownload} disabled={disabled} />
    </>
  );
};

export default DownloadSection;
