import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { IconSettingsType } from '../app/components/types';

export async function generateIcons(filePath: string, settings: IconSettingsType & { iconType: string }) {
  try {
    console.log(`Generating icons for ${settings.iconType} from file: ${filePath}`);

    // Check if the file exists
    await fs.access(filePath);

    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const sizes = settings.iconType === 'android' 
      ? [36, 48, 72, 96, 144, 192] 
      : [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180];

    console.log(`Icon sizes to generate: ${sizes.join(', ')}`);

    const icons = [];

    for (const size of sizes) {
      const outputPath = path.join(tempDir, `icon_${size}.png`);
      console.log(`Attempting to generate icon: ${outputPath}`);

      try {
        let sharpInstance = sharp(filePath);

        // Apply scaling
        const paddedSize = size - (settings.padding * 2);
        if (settings.scaling === 'crop') {
          sharpInstance = sharpInstance
            .resize(paddedSize, paddedSize, { fit: 'cover', position: 'center' });
        } else { // 'center'
          sharpInstance = sharpInstance
            .resize(paddedSize, paddedSize, { 
              fit: 'contain', 
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            });
        }

        // Apply shape
        if (settings.shape !== 'square') {
          let maskBuffer;
          if (settings.shape === 'circle') {
            maskBuffer = Buffer.from(`
              <svg width="${paddedSize}" height="${paddedSize}">
                <circle cx="${paddedSize/2}" cy="${paddedSize/2}" r="${paddedSize/2}" fill="black"/>
              </svg>
            `);
          } else if (settings.shape === 'squircle') {
            const radius = paddedSize * 0.2;
            maskBuffer = Buffer.from(`
              <svg width="${paddedSize}" height="${paddedSize}">
                <rect x="0" y="0" width="${paddedSize}" height="${paddedSize}" rx="${radius}" ry="${radius}" fill="black"/>
              </svg>
            `);
          }

          if (maskBuffer) {
            sharpInstance = sharpInstance.composite([{
              input: maskBuffer,
              blend: 'dest-in'
            }]);
          }
        }

        // Apply effects
        if (settings.effect === 'shadow') {
          const shadow = await sharp({
            create: { width: paddedSize + 10, height: paddedSize + 10, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.2 } }
          }).blur(5).toBuffer();
          
          sharpInstance = sharpInstance
            .extend({ top: 5, bottom: 5, left: 5, right: 5, background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .composite([{ input: shadow }, { input: await sharpInstance.toBuffer() }]);
        } else if (settings.effect === 'gloss') {
          const gloss = Buffer.from(`
            <svg width="${paddedSize}" height="${paddedSize}">
              <defs>
                <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
                  <stop offset="50%" style="stop-color:white;stop-opacity:0.1" />
                  <stop offset="50%" style="stop-color:white;stop-opacity:0" />
                  <stop offset="100%" style="stop-color:white;stop-opacity:0.1" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="${paddedSize}" height="${paddedSize}" fill="url(#gloss)" />
            </svg>
          `);
          sharpInstance = sharpInstance.composite([{ input: gloss, blend: 'over' }]);
        }

        // Apply background color and padding
        sharpInstance = sharpInstance
          .extend({
            top: settings.padding,
            bottom: settings.padding,
            left: settings.padding,
            right: settings.padding,
            background: { r: 0, g: 0, b: 0, alpha: 0 } // Start with transparent background
          })
          .flatten({ background: settings.background.color }); // Apply background color

        await sharpInstance.toFile(outputPath);
        console.log(`Successfully generated icon: ${outputPath}`);
        
        icons.push({ path: outputPath, name: `icon_${size}.png` });
      } catch (iconError) {
        console.error(`Error generating icon for size ${size}:`, iconError);
        // Continue with the next size instead of breaking the entire process
      }
    }

    console.log(`Successfully generated ${icons.length} icons`);
    return icons;
  } catch (error) {
    console.error('Error in generateIcons:', error);
    throw new Error(`Icon generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}