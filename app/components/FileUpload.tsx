import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div
      className={`mb-6 w-full cursor-pointer rounded-xl border-2 border-dashed p-6 transition-colors ${
        dragActive
          ? 'border-ring bg-muted'
          : 'border-border bg-muted/40 hover:bg-muted/70'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image file"
      />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Drop an image here</p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse — PNG, JPG, WebP</p>
      </div>
    </div>
  );
};

export default FileUpload;
