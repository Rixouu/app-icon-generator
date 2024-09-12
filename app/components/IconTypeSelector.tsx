import React from 'react';

interface IconTypeSelectorProps {
  selectedType: 'android' | 'ios';
  onTypeChange: (type: 'android' | 'ios') => void;
  isDarkMode: boolean;
}

const IconTypeSelector: React.FC<IconTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  isDarkMode,
}) => {
  return (
    <div className="mb-4">
      <div className={`flex rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} p-1`}>
        {['android', 'ios'].map((type) => (
          <button
            key={type}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedType === type
                ? isDarkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow'
                : isDarkMode
                ? 'text-gray-300 hover:bg-gray-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onTypeChange(type as 'android' | 'ios')}
          >
            {type === 'android' ? '🤖 Android' : '🍎 iOS'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconTypeSelector;