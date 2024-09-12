import React, { useEffect, useRef } from 'react';
import { IconPreviewProps } from './types';

const IconPreview: React.FC<IconPreviewProps> = ({ iconType, uploadedImage, settings, isDarkMode }) => {
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
          sx = (size - sWidth) / 2;
          sy = (size - sHeight) / 2;
        } else { // crop
          const scale = Math.max(paddedSize / img.width, paddedSize / img.height);
          sWidth = paddedSize;
          sHeight = paddedSize;
          sx = (img.width - sWidth / scale) / 2;
          sy = (img.height - sHeight / scale) / 2;
        }

        ctx.drawImage(img, sx, sy, img.width, img.height, settings.padding, settings.padding, paddedSize, paddedSize);

        // Apply shape
        if (settings.shape !== 'square') {
          ctx.globalCompositeOperation = 'destination-in';
          ctx.beginPath();
          if (settings.shape === 'circle') {
            ctx.arc(size / 2, size / 2, paddedSize / 2, 0, Math.PI * 2);
          } else if (settings.shape === 'squircle') {
            const radius = paddedSize * 0.2;
            ctx.moveTo(settings.padding + radius, settings.padding);
            ctx.lineTo(size - settings.padding - radius, settings.padding);
            ctx.quadraticCurveTo(size - settings.padding, settings.padding, size - settings.padding, settings.padding + radius);
            ctx.lineTo(size - settings.padding, size - settings.padding - radius);
            ctx.quadraticCurveTo(size - settings.padding, size - settings.padding, size - settings.padding - radius, size - settings.padding);
            ctx.lineTo(settings.padding + radius, size - settings.padding);
            ctx.quadraticCurveTo(settings.padding, size - settings.padding, settings.padding, size - settings.padding - radius);
            ctx.lineTo(settings.padding, settings.padding + radius);
            ctx.quadraticCurveTo(settings.padding, settings.padding, settings.padding + radius, settings.padding);
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
          ctx.fillRect(settings.padding, settings.padding, paddedSize, paddedSize);
        }
      };
      img.src = URL.createObjectURL(uploadedImage);
    }
  }, [uploadedImage, settings]);

  return (
    <>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Icon Preview
      </h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className={`flex justify-center items-center w-64 h-64 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {uploadedImage ? (
            <canvas ref={canvasRef} className="max-w-full max-h-full" />
          ) : (
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload an image<br />to see the preview
            </p>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {iconType === 'android' ? 'Android' : 'iOS'} Icon
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This preview shows how your icon will look on {iconType === 'android' ? 'Android' : 'iOS'} devices.
            The final output will include multiple sizes optimized for different screen densities.
          </p>
          <div className={`grid grid-cols-2 gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div>
              <p className="font-medium">Shape:</p>
              <p>{settings.shape}</p>
            </div>
            <div>
              <p className="font-medium">Effect:</p>
              <p>{settings.effect}</p>
            </div>
            <div>
              <p className="font-medium">Background:</p>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: settings.background.color }}></div>
                <p>{settings.background.color}</p>
              </div>
            </div>
            <div>
              <p className="font-medium">Padding:</p>
              <p>{settings.padding}px</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IconPreview;