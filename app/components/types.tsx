// Icon Settings
export interface IconSettingsType {
  background: {
    color: string;
    type: 'solid' | 'gradient';
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      angle?: number; // for linear gradients
    };
  };
  icon: {
    url: string;
    color?: string;
  };
  padding: number;
  scaling: 'center' | 'crop' | 'fit';
  shape: 'square' | 'circle' | 'squircle' | 'rounded';
  effect: 'none' | 'shadow' | 'gloss' | 'reflection';
  borderRadius?: number; // for 'rounded' shape
}

// Preview Options
export interface PreviewOptionsType {
  platform: 'ios' | 'android' | 'web';
  size: number;
  darkMode: boolean;
}

// Generated Icon
export interface GeneratedIconType {
  url: string;
  size: number;
  platform: 'ios' | 'android' | 'web';
}

// API Response
export interface ApiResponseType {
  success: boolean;
  data?: GeneratedIconType[];
  error?: string;
}

// User Settings
export interface UserSettingsType {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
}

// Project
export interface ProjectType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  iconSettings: IconSettingsType;
}

// Export Options
export interface ExportOptionsType {
  format: 'png' | 'jpg' | 'svg';
  sizes: number[];
  platforms: ('ios' | 'android' | 'web')[];
  includeMetadata: boolean;
}

// Component Props
export interface IconPreviewProps {
  iconType: 'android' | 'ios' | 'web';
  uploadedImage: File | null; // Add this line
  settings: IconSettingsType;
  isDarkMode: boolean; // Add this line
  size?: number; // Make this optional since it's not used in the current implementation
}

export interface IconGeneratorProps {
  onGenerate: (settings: IconSettingsType) => void;
  initialSettings?: Partial<IconSettingsType>;
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptionsType) => void;
}

// Add any additional types or interfaces as needed for your application
