"use client";

import React, { useState } from 'react';
import IconTypeSelector from './components/IconTypeSelector';
import IconPreview from './components/IconPreview';
import IconSettings from './components/IconSettings';
import FileUpload from './components/FileUpload';
import { IconSettingsType } from './components/types';
import DownloadSection from './components/DownloadSection';

export default function Home() {
  const [iconType, setIconType] = useState<'android' | 'ios'>('android');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [iconSettings, setIconSettings] = useState<IconSettingsType>({
    icon: { url: '' }, // Initialize with an empty URL
    scaling: 'center',
    effect: 'none',
    padding: 0,
    background: {
      color: '#000000',
      type: 'solid',
    },
    shape: 'square',
  });

  const handleDownload = async () => {
    console.log('Download button clicked');
    if (!uploadedImage) {
      console.error('No image uploaded');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('iconType', iconType);
      formData.append('settings', JSON.stringify(iconSettings));
      formData.append('file', uploadedImage);

      const response = await fetch('/api/generate-icons', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate icons');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'icons.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading icons:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    console.log('Image uploaded:', file.name);
  };

  const handleSettingsChange = (newSettings: Partial<IconSettingsType>) => {
    setIconSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
      padding: typeof newSettings.padding === 'string'
        ? parseInt(newSettings.padding, 10)
        : newSettings.padding ?? prevSettings.padding,
      background: {
        ...prevSettings.background,
        ...(newSettings.background || {}),
      },
    }));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Icon Generator
          </h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'}`}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 flex flex-col">
            <div className={`flex-grow p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-6">
                <IconTypeSelector
                  selectedType={iconType}
                  onTypeChange={setIconType}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="mb-8">
                <FileUpload onFileUpload={handleImageUpload} isDarkMode={isDarkMode} />
              </div>
              <IconSettings 
                settings={iconSettings} 
                onSettingsChange={handleSettingsChange}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className={`flex-grow p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mb-6`}>
              <IconPreview
                iconType={iconType}
                uploadedImage={uploadedImage}
                settings={iconSettings}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <DownloadSection
                onDownload={handleDownload}
                disabled={!uploadedImage}
                isDarkMode={isDarkMode}
                iconType={iconType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}