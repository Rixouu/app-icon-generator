import React from 'react';

interface DownloadButtonProps {
  onDownload: () => void;
  disabled: boolean;
  isDarkMode: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload, disabled, isDarkMode }) => {
  return (
    <button
      onClick={onDownload}
      disabled={disabled}
      className={`
        w-full px-6 py-3 text-lg font-semibold rounded-lg shadow-md
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-opacity-75
        ${
          disabled
            ? `cursor-not-allowed opacity-50 ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
              }`
            : `transform hover:scale-105 hover:shadow-lg ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400'
              }`
        }
      `}
    >
      <div className="flex items-center justify-center">
        <svg
          className="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download Icons
      </div>
    </button>
  );
};

export default DownloadButton;