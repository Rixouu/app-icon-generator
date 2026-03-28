import { NextRequest, NextResponse } from 'next/server';
import type { IconSettingsType } from '@/app/components/types';
import { generateIcons } from '@/utils/IconGenerator';
import fs from 'fs/promises';
import archiver from 'archiver';

export async function GET() {
  return NextResponse.json({ message: 'API route is working' });
}

export async function POST(req: NextRequest) {
  const tempPaths: string[] = [];

  try {
    const formData = await req.formData();
    const iconType = formData.get('iconType') as string;
    const settingsRaw = formData.get('settings') as string;
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    let settings: IconSettingsType;
    try {
      settings = JSON.parse(settingsRaw) as IconSettingsType;
    } catch {
      return NextResponse.json({ error: 'Invalid settings JSON' }, { status: 400 });
    }

    const tempFilePath = `/tmp/uploaded_image_${Date.now()}.png`;
    tempPaths.push(tempFilePath);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(tempFilePath, new Uint8Array(arrayBuffer));

    const icons = await generateIcons(tempFilePath, { ...settings, iconType });

    for (const icon of icons) {
      tempPaths.push(icon.path);
    }

    if (icons.length === 0) {
      return NextResponse.json(
        { error: 'No icons were generated. Check your image and settings.' },
        { status: 500 },
      );
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Uint8Array[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(new Uint8Array(chunk)));

    const streamDone = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', reject);
    });

    for (const icon of icons) {
      const fileContent = await fs.readFile(icon.path);
      archive.append(fileContent, { name: icon.name });
    }

    await archive.finalize();
    await streamDone;

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=icons.zip',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error generating icons',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    await Promise.all(
      tempPaths.map((p) =>
        fs.unlink(p).catch(() => {
          /* ignore */
        }),
      ),
    );
  }
}
