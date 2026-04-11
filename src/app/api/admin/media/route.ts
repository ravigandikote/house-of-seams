import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'uploads');

export async function GET() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const files = await fs.readdir(UPLOAD_DIR);
    const images = files
      .filter((f) => !f.startsWith('.'))
      .map((filename) => ({
        filename,
        url: `/images/uploads/${filename}`,
      }));
    return NextResponse.json(images);
  } catch {
    return NextResponse.json([]);
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  // Prevent directory traversal
  const safeName = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeName);

  try {
    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
