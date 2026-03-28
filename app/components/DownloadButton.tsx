import React from 'react';

interface DownloadButtonProps {
  onDownload: () => void;
  disabled: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload, disabled }) => {
  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={disabled}
      className={`w-full rounded-xl px-6 py-3.5 text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        disabled
          ? 'cursor-not-allowed border border-border bg-muted text-muted-foreground'
          : 'bg-ring text-white shadow-md hover:opacity-95'
      }`}
    >
      Download ZIP
    </button>
  );
};

export default DownloadButton;
