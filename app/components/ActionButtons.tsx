import React from 'react';

interface ActionButtonsProps {
  onDownload: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDownload,
  onToggleDarkMode,
  isDarkMode,
}) => {
  return (
    <div className="space-x-4">
      <button 
        onClick={onDownload}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 transform hover:scale-105"
      >
        Download Icons
      </button>
      <button 
        onClick={onToggleDarkMode} 
        className={`px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 transform hover:scale-105 ${
          isDarkMode 
            ? 'bg-white text-black hover:bg-gray-800 focus:ring-gray-700' 
            : 'bg-black text-white hover:bg-gray-100 focus:ring-gray-200'
        }`}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
};

export default ActionButtons;