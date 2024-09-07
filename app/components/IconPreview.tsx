import React, { useEffect, useRef } from 'react';
import { IconSettingsType } from '../page';

interface IconPreviewProps {
  iconType: 'android' | 'ios';
  uploadedImage: File | null;
  settings: IconSettingsType;
  isDarkMode: boolean;
  onDownload: () => void;
}

const IconPreview: React.FC<IconPreviewProps> = ({ iconType, uploadedImage, settings, isDarkMode, onDownload }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply background color
        ctx.fillStyle = settings.background.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate padding
        const paddedSize = size - (settings.padding * 2);

        // Apply scaling
        let sx, sy, sWidth, sHeight;
        if (settings.scaling === 'center') {
          const scale = Math.min(paddedSize / img.width, paddedSize / img.height);
          sWidth = img.width * scale;
          sHeight = img.height * scale;
          sx = (paddedSize - sWidth) / 2 + settings.padding;
          sy = (paddedSize - sHeight) / 2 + settings.padding;
        } else { // crop
          const scale = Math.max(paddedSize / img.width, paddedSize / img.height);
          sWidth = paddedSize;
          sHeight = paddedSize;
          sx = ((img.width * scale - paddedSize) / 2 / scale) + settings.padding;
          sy = ((img.height * scale - paddedSize) / 2 / scale) + settings.padding;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, settings.padding, settings.padding, paddedSize, paddedSize);

        // Apply shape
        if (settings.shape !== 'square') {
          ctx.globalCompositeOperation = 'destination-in';
          ctx.beginPath();
          if (settings.shape === 'circle') {
            ctx.arc(size / 2, size / 2, (size - settings.padding * 2) / 2, 0, Math.PI * 2);
          } else if (settings.shape === 'squircle') {
            const squirclePath = new Path2D(`
              M ${settings.padding} ${size / 2}
              C ${settings.padding} ${settings.padding}, ${settings.padding} ${settings.padding}, ${size / 2} ${settings.padding}
              C ${size - settings.padding} ${settings.padding}, ${size - settings.padding} ${settings.padding}, ${size - settings.padding} ${size / 2}
              C ${size - settings.padding} ${size - settings.padding}, ${size - settings.padding} ${size - settings.padding}, ${size / 2} ${size - settings.padding}
              C ${settings.padding} ${size - settings.padding}, ${settings.padding} ${size - settings.padding}, ${settings.padding} ${size / 2}
            `);
            ctx.fill(squirclePath);
          }
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }

        // Apply effects
        if (settings.effect === 'shadow') {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;
          ctx.drawImage(canvas, 0, 0);
          ctx.shadowColor = 'transparent';
        } else if (settings.effect === 'gloss') {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };
      img.src = URL.createObjectURL(uploadedImage);
    }
  }, [uploadedImage, settings]);

  return (
    <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Icon Preview
      </h2>
      <div className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {iconType === 'android' ? 'Android' : 'iOS'} Icon
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            512x512 px
          </p>
        </div>
        <div className="flex justify-center items-center w-64 h-64 bg-gray-200 rounded-lg overflow-hidden">
          {uploadedImage ? (
            <canvas ref={canvasRef} className="max-w-full max-h-full" />
          ) : (
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload an image<br />to see the preview
            </p>
          )}
        </div>
        {uploadedImage && (
          <div className="mt-4 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Shape: {settings.shape.charAt(0).toUpperCase() + settings.shape.slice(1)}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Effect: {settings.effect.charAt(0).toUpperCase() + settings.effect.slice(1)}
            </p>
          </div>
        )}
        {uploadedImage && (
          <div className="mt-6">
            <button
              onClick={onDownload}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 transform hover:scale-105"
            >
              Download Icons
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconPreview;