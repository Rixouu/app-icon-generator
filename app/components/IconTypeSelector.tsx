import React from 'react';

interface IconTypeSelectorProps {
  selectedType: 'android' | 'ios';
  onTypeChange: (type: 'android' | 'ios') => void;
}

const IconTypeSelector: React.FC<IconTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-muted-foreground mb-2">Platform</p>
      <div className="flex rounded-xl border border-border bg-muted/50 p-1">
        {(['android', 'ios'] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              selectedType === type
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onTypeChange(type)}
          >
            {type === 'android' ? 'Android' : 'iOS'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconTypeSelector;
