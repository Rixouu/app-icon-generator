import React, { useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isDarkMode: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isDarkMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`w-full p-6 mb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload file"
      />
      <div className="text-center">
        <svg
          className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload;