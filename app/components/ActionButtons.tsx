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
    <div className="flex justify-between mt-4">
      <button 
        onClick={onDownload}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
      >
        Download Icons
      </button>
      <button 
        onClick={onToggleDarkMode} 
        className={`px-4 py-2 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ${
          isDarkMode 
            ? 'bg-white text-black hover:bg-gray-200 focus:ring-gray-300' 
            : 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-600'
        }`}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
};

export default ActionButtons;