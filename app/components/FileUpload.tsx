import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  title?: string;
  description?: string;
  selectedFileName?: string | null;
  onClear?: () => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  title = 'Drop an image here',
  description = 'or click to browse — PNG, JPG, WebP',
  selectedFileName,
  onClear,
  className = 'mb-6',
}) => {
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
      className={`${className} w-full cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-colors ${
        dragActive
          ? 'border-ring bg-muted'
          : 'border-border bg-muted/30 hover:bg-muted/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
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
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        {selectedFileName ? (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="max-w-[200px] truncate rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
              {selectedFileName}
            </span>
            {onClear ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FileUpload;
