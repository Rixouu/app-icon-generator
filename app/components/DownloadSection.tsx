import React from 'react';
import DownloadButton from './DownloadButton';

interface DownloadSectionProps {
  onDownload: () => void;
  disabled: boolean;
  isDarkMode: boolean;
  iconType: 'android' | 'ios';
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onDownload, disabled, isDarkMode, iconType }) => {
  const iconSizes = iconType === 'android' 
    ? [36, 48, 72, 96, 144, 192]
    : [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180];

  return (
    <>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Download Icons
      </h2>
      <div className="mb-6">
        <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your download will include the following icon sizes (in pixels):
        </p>
        <div className="flex flex-wrap gap-2">
          {iconSizes.map(size => (
            <span key={size} className={`px-2 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              {size}x{size}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          File format: PNG
        </p>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          All icons will be optimized for {iconType === 'android' ? 'Android' : 'iOS'} devices and ready to use in your app.
        </p>
      </div>
      <DownloadButton onDownload={onDownload} disabled={disabled} isDarkMode={isDarkMode} />
    </>
  );
};

export default DownloadSection;