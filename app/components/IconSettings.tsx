import React from 'react';
import type { IconSettingsType } from './types';

interface IconSettingsProps {
  settings: IconSettingsType;
  onSettingsChange: (newSettings: Partial<IconSettingsType>) => void;
}

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40';

const labelClass = 'mb-2 block text-sm font-medium text-foreground';

const IconSettings: React.FC<IconSettingsProps> = ({ settings, onSettingsChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass} htmlFor="scalingSelect">
          Scaling
        </label>
        <select
          id="scalingSelect"
          value={settings.scaling}
          onChange={(e) => onSettingsChange({ scaling: e.target.value as 'center' | 'crop' })}
          className={inputClass}
        >
          <option value="center">Center (contain)</option>
          <option value="crop">Crop (cover)</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="effectSelect">
          Effect
        </label>
        <select
          id="effectSelect"
          value={settings.effect}
          onChange={(e) =>
            onSettingsChange({ effect: e.target.value as 'none' | 'shadow' | 'gloss' })
          }
          className={inputClass}
        >
          <option value="none">None</option>
          <option value="shadow">Shadow</option>
          <option value="gloss">Gloss</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="paddingInput">
          Padding
        </label>
        <input
          id="paddingInput"
          type="range"
          min={0}
          max={100}
          value={settings.padding}
          onChange={(e) => onSettingsChange({ padding: parseInt(e.target.value, 10) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
        />
        <span className="mt-1 block text-xs text-muted-foreground">{settings.padding}px</span>
      </div>

      <div>
        <label className={labelClass} htmlFor="bgTransparent">
          Background
        </label>
        <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            id="bgTransparent"
            type="checkbox"
            checked={settings.background.transparent === true}
            onChange={(e) =>
              onSettingsChange({
                background: {
                  ...settings.background,
                  transparent: e.target.checked,
                },
              })
            }
            className="size-4 rounded border-border text-ring focus:ring-ring"
          />
          <span>Transparent export (PNG alpha)</span>
        </label>
        <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
          When off, padding and empty areas are filled with the color below. When on, they stay
          transparent in the downloaded ZIP.
        </p>
        <div className={`flex items-center gap-3 ${settings.background.transparent ? 'pointer-events-none opacity-40' : ''}`}>
          <input
            id="bgColor"
            type="color"
            value={settings.background.color}
            disabled={settings.background.transparent === true}
            onChange={(e) =>
              onSettingsChange({
                background: {
                  ...settings.background,
                  color: e.target.value,
                },
              })
            }
            className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-0 disabled:cursor-not-allowed"
          />
          <span className="font-mono text-xs text-muted-foreground">{settings.background.color}</span>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="shapeSelect">
          Shape
        </label>
        <select
          id="shapeSelect"
          value={settings.shape}
          onChange={(e) =>
            onSettingsChange({ shape: e.target.value as 'square' | 'circle' | 'squircle' })
          }
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
