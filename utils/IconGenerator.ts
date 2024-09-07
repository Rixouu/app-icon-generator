import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { IconSettingsType } from '../app/page';

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

        if (settings.scaling === 'crop') {
          sharpInstance = sharpInstance
            .resize(size, size, { 
              fit: 'cover', 
              position: 'center'
            })
            .extract({ left: 0, top: 0, width: size, height: size });
        } else { // 'center' or any other option
          sharpInstance = sharpInstance
            .resize(size, size, { 
              fit: 'contain', 
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            });
        }

        if (settings.mask) {
          if (settings.shape === 'circle') {
            sharpInstance = sharpInstance.composite([{
              input: Buffer.from(`<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="black"/></svg>`),
              blend: 'dest-in'
            }]);
          } else if (settings.shape === 'squircle') {
            const mask = await sharp({
              create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              }
            })
            .composite([{
              input: Buffer.from(`<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="white"/></svg>`),
              blend: 'dest-in'
            }])
            .toBuffer();

            sharpInstance = sharpInstance.composite([{ input: mask, blend: 'dest-in' }]);
          }
        }

        if (settings.effect === 'shadow') {
          const shadow = await sharp({
            create: { width: size + 10, height: size + 10, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.2 } }
          }).blur(5).toBuffer();
          
          sharpInstance = sharpInstance
            .extend({ top: 5, bottom: 5, left: 5, right: 5, background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .composite([{ input: shadow }, { input: await sharpInstance.toBuffer() }]);
        }

        if ('type' in settings.background && settings.background.type === 'color') {
          sharpInstance = sharpInstance.flatten({ background: settings.background.color });
        }

        if (settings.padding > 0) {
          sharpInstance = sharpInstance.extend({
            top: settings.padding,
            bottom: settings.padding,
            left: settings.padding,
            right: settings.padding,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
        }

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