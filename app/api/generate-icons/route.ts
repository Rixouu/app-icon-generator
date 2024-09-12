import { NextRequest, NextResponse } from 'next/server';
import { generateIcons } from '@/utils/IconGenerator';
import fs from 'fs/promises';
import archiver from 'archiver';

export async function GET() {
  return NextResponse.json({ message: "API route is working" });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const iconType = formData.get('iconType') as string;
    const settings = JSON.parse(formData.get('settings') as string);
    const file = formData.get('file') as File;

    const tempFilePath = `/tmp/uploaded_image_${Date.now()}.png`;
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

    const icons = await generateIcons(tempFilePath, { ...settings, iconType });

    // Create a zip file
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    const chunks: Uint8Array[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => {});

    for (const icon of icons) {
      const fileContent = await fs.readFile(icon.path);
      archive.append(fileContent, { name: icon.name });
    }

    await archive.finalize();

    // Clean up temporary files
    await fs.unlink(tempFilePath);
    for (const icon of icons) {
      await fs.unlink(icon.path);
    }

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=icons.zip'
      }
    });

  } catch (error) {
    console.error('Detailed error in generate-icons:', error);
    return NextResponse.json({ 
      error: 'Error generating icons', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}