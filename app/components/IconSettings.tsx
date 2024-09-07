import React from 'react';
import { IconSettingsType } from '../page';

interface IconSettingsProps {
  settings: IconSettingsType;
  onSettingsChange: (newSettings: Partial<IconSettingsType>) => void;
  isDarkMode: boolean;
}

const IconSettings: React.FC<IconSettingsProps> = ({ settings, onSettingsChange, isDarkMode }) => {
  const inputClass = `w-full px-3 py-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const labelClass = `block mb-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass} htmlFor="scalingSelect">Scaling</label>
        <select
          id="scalingSelect"
          value={settings.scaling}
          onChange={(e) => onSettingsChange({ scaling: e.target.value as 'center' | 'crop' })}
          className={selectClass}
        >
          <option value="center">Center</option>
          <option value="crop">Crop</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>
          <input
            type="checkbox"
            checked={settings.mask}
            onChange={(e) => onSettingsChange({ mask: e.target.checked })}
            className="mr-2 rounded"
          />
          Apply Mask
        </label>
      </div>

      <div>
        <label className={labelClass} htmlFor="effectSelect">Effect</label>
        <select
          id="effectSelect"
          value={settings.effect}
          onChange={(e) => onSettingsChange({ effect: e.target.value as 'none' | 'shadow' | 'gloss' })}
          className={selectClass}
          aria-label="Effect"
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
          type="number"
          value={settings.padding}
          onChange={(e) => onSettingsChange({ padding: Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)) })}
          className={inputClass}
          min="0"
          max="100"
          aria-label="Padding"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="bgColor">Background Color</label>
        <input
          id="bgColor"
          type="color"
          value={settings.background.color}
          onChange={(e) => onSettingsChange({ background: { color: e.target.value } })}
          className={`${inputClass} h-10`}
          aria-label="Background Color"
        />
      </div>

      <div>
        <label className={labelClass}>Shape</label>
        <select
          value={settings.shape}
          onChange={(e) => onSettingsChange({ shape: e.target.value as 'square' | 'circle' | 'squircle' })}
          className={selectClass}
          aria-label="Shape"
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