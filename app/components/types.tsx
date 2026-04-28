import type { IconSettingsType as SharedIconSettingsType, PlatformType } from '@/utils/iconStudio';

export type IconSettingsType = SharedIconSettingsType;

// Preview Options
export interface PreviewOptionsType {
  platform: PlatformType;
  size: number;
  darkMode: boolean;
}

// Generated Icon
export interface GeneratedIconType {
  url: string;
  size: number;
  platform: PlatformType;
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
  platforms: PlatformType[];
  includeMetadata: boolean;
}

// Component Props
export interface IconPreviewProps {
  iconType: PlatformType;
  uploadedImage: File | null;
  backgroundImage: File | null;
  settings: IconSettingsType;
  size?: number;
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
