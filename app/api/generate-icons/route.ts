import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { generateIcons } from '@/utils/IconGenerator';
import archiver from 'archiver';

export async function GET() {
  return NextResponse.json({ message: "API route is working" });
}

export async function POST(req: NextRequest) {
  console.log('POST request received');
  try {
    const data = await req.formData();
    console.log('FormData received:', data);

    const file = data.get('file') as File;
    const settings = JSON.parse(data.get('settings') as string);
    const iconType = data.get('iconType') as string;

    console.log('Parsed data:', { iconType, settings });

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const filePath = `/tmp/${file.name}`;
    await fs.promises.writeFile(filePath, Buffer.from(buffer));
    console.log(`File written to ${filePath}`);

    const icons = await generateIcons(filePath, { ...settings, iconType });
    console.log(`Icons generated: ${icons.length}`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Uint8Array[] = [];

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => console.log('Archiving completed'));

    icons.forEach((icon) => {
      archive.append(fs.createReadStream(icon.path), { name: icon.name });
    });

    await archive.finalize();
    console.log('Archive finalized');

    const zipBuffer = Buffer.concat(chunks);

    // Clean up temporary files
    await fs.promises.unlink(filePath);
    await Promise.all(icons.map(icon => fs.promises.unlink(icon.path)));
    console.log('Temporary files cleaned up');

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=generated-icons.zip',
      },
    });
  } catch (error) {
    console.error('Detailed error in generate-icons:', error);
    return NextResponse.json({ 
      error: 'Error generating icons', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}