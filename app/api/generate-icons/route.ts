import { NextRequest, NextResponse } from 'next/server';
import type { IconSettingsType } from '@/app/components/types';
import { generateIcons } from '@/utils/IconGenerator';
import { getPlatformLabel, type PlatformType } from '@/utils/iconStudio';
import archiver from 'archiver';

export async function GET() {
  return NextResponse.json({ message: 'API route is working' });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const iconType = formData.get('iconType') as string;
    const settingsRaw = formData.get('settings') as string;
    const file = formData.get('file') as File | null;
    const backgroundFile = formData.get('backgroundFile') as File | null;

    let settings: IconSettingsType;
    try {
      settings = JSON.parse(settingsRaw) as IconSettingsType;
    } catch {
      return NextResponse.json({ error: 'Invalid settings JSON' }, { status: 400 });
    }

    const sourceBuffer =
      file && file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : null;
    const backgroundBuffer =
      backgroundFile && backgroundFile instanceof Blob
        ? Buffer.from(await backgroundFile.arrayBuffer())
        : null;
    const icons = await generateIcons(
      sourceBuffer,
      backgroundBuffer,
      settings,
      iconType as PlatformType,
    );

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
      archive.append(icon.content, { name: icon.name });
    }

    await archive.finalize();
    await streamDone;

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${getPlatformLabel(iconType as PlatformType).toLowerCase().replaceAll(' ', '-')}-icons.zip`,
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
  }
}
