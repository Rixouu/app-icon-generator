import React from 'react';
import { IconSettingsType } from './types';

interface IconSettingsProps {
  settings: IconSettingsType;
  onSettingsChange: (newSettings: Partial<IconSettingsType>) => void;
  isDarkMode: boolean;
}

const IconSettings: React.FC<IconSettingsProps> = ({ settings, onSettingsChange, isDarkMode }) => {
  const inputClass = `w-full px-3 py-2 rounded-md ${
    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
  } border ${
    isDarkMode ? 'border-gray-600' : 'border-gray-300'
  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`;

  const labelClass = `block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  return (
    <div className="space-y-6 overflow-y-auto flex-grow">
      <div>
        <label className={labelClass} htmlFor="scalingSelect">Scaling</label>
        <select
          id="scalingSelect"
          value={settings.scaling}
          onChange={(e) => onSettingsChange({ scaling: e.target.value as 'center' | 'crop' })}
          className={inputClass}
        >
          <option value="center">Center</option>
          <option value="crop">Crop</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="effectSelect">Effect</label>
        <select
          id="effectSelect"
          value={settings.effect}
          onChange={(e) => onSettingsChange({ effect: e.target.value as 'none' | 'shadow' | 'gloss' })}
          className={inputClass}
        >
          <option value="none">None</option>
          <option value="shadow">Shadow</option>
          <option value="gloss">Gloss</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="paddingInput">Padding</label>
        <input
          id="paddingInput"
          type="range"
          min="0"
          max="100"
          value={settings.padding}
          onChange={(e) => onSettingsChange({ padding: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className={`block mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {settings.padding}px
        </span>
      </div>

      <div>
        <label className={labelClass} htmlFor="bgColor">Background Color</label>
        <div className="flex items-center">
          <input
            id="bgColor"
            type="color"
            value={settings.background.color}
            onChange={(e) => onSettingsChange({ 
              background: { 
                color: e.target.value,
                type: settings.background.type
              } 
            })}
            className={`${inputClass} h-10 w-10 p-0 rounded-full`}
          />
          <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {settings.background.color}
          </span>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="shapeSelect">Shape</label>
        <select
          id="shapeSelect"
          value={settings.shape}
          onChange={(e) => onSettingsChange({ shape: e.target.value as 'square' | 'circle' | 'squircle' })}
          className={inputClass}
        >
          <option value="square">Square</option>
          <option value="circle">Circle</option>
          <option value="squircle">Squircle</option>
        </select>
      </div>
    </div>
  );
};

export default IconSettings;