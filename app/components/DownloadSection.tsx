import React from 'react';
import DownloadButton from './DownloadButton';

interface DownloadSectionProps {
  onDownload: () => void;
  disabled: boolean;
  iconType: 'android' | 'ios';
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onDownload, disabled, iconType }) => {
  const iconSizes =
    iconType === 'android' ? [36, 48, 72, 96, 144, 192] : [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180];

  const platform = iconType === 'android' ? 'Android' : 'iOS';

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Download</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        One ZIP of PNG files, sized for typical {platform} launcher and asset slots.
      </p>
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Sizes (px)
        </p>
        <div className="flex flex-wrap gap-2">
          {iconSizes.map((size) => (
            <span
              key={size}
              className="rounded-full border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs text-foreground"
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
