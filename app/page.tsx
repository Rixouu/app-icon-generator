"use client";

import React, { useState } from 'react';
import IconTypeSelector from './components/IconTypeSelector';
import IconPreview from './components/IconPreview';
import IconSettings from './components/IconSettings';
import FileUpload from './components/FileUpload';

export type IconSettingsType = {
  scaling: 'center' | 'crop';
  mask: boolean;
  effect: 'none' | 'shadow' | 'gloss';
  padding: number;
  background: {
    color: string;
  };
  shape: 'square' | 'circle' | 'squircle';
};

export default function Home() {
  const [iconType, setIconType] = useState<'android' | 'ios'>('android');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [iconSettings, setIconSettings] = useState<IconSettingsType>({
    scaling: 'center',
    mask: false,
    effect: 'none',
    padding: 0,
    background: {
      color: '#000000',
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
      formData.append('file', uploadedImage);
      formData.append('settings', JSON.stringify(iconSettings));
      formData.append('iconType', iconType);
  
      console.log('Sending request to generate icons');
      const response = await fetch('/api/generate-icons', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="?(.+)"?/i);
      const filename = filenameMatch ? filenameMatch[1] : 'generated-icons.zip';
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
  
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      console.log('Download completed');
    } catch (error) {
      console.error('Error in handleDownload:', error);
      alert('An error occurred while generating icons. Please try again later.');
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
        <header className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Icon Generator
          </h1>
          <div className="flex justify-between items-center">
            <IconTypeSelector
              selectedType={iconType}
              onTypeChange={setIconType}
              isDarkMode={isDarkMode}
            />
            <button 
              onClick={toggleDarkMode} 
              className={`px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-800 focus:ring-gray-700' 
                  : 'bg-black text-white hover:bg-gray-100 focus:ring-gray-200'
              }`}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Upload Icon
              </h2>
              <FileUpload onFileUpload={handleImageUpload} isDarkMode={isDarkMode} />
              <IconSettings 
                settings={iconSettings} 
                onSettingsChange={handleSettingsChange}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <IconPreview
              iconType={iconType}
              uploadedImage={uploadedImage}
              settings={iconSettings}
              isDarkMode={isDarkMode}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}