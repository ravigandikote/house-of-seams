import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'uploads');

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const filename = `${Date.now()}-${sanitizedName}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));

  const url = `/images/uploads/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
