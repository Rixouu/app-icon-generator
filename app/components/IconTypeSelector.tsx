import React from 'react';
import type { PlatformType } from '@/utils/iconStudio';

interface IconTypeSelectorProps {
  selectedType: PlatformType;
  onTypeChange: (type: PlatformType) => void;
}

const IconTypeSelector: React.FC<IconTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Platform</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the asset target before exporting.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-muted p-1.5">
        {(['android', 'ios', 'web', 'all'] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              selectedType === type
                ? 'bg-ring text-[#021714] shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-card hover:text-foreground'
            }`}
            onClick={() => onTypeChange(type)}
          >
            {type === 'android'
              ? 'Android'
              : type === 'ios'
                ? 'iOS'
                : type === 'web'
                  ? 'Web'
                  : 'All'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconTypeSelector;
