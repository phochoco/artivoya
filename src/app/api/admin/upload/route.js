import { put, del, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const series = formData.get('series') || 'robot';
  const type = formData.get('type') || 'gallery'; // 'gallery' or 'thumbnail'

  if (!file) {
    return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
  }

  const path = type === 'thumbnail'
    ? `series/${series}.png`
    : `gallery/${series}/${file.name}`;

  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return NextResponse.json({
    url: blob.url,
    path: path,
    series: series,
    type: type,
  });
}

export async function GET(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix') || '';

  const { blobs } = await list({ prefix });

  return NextResponse.json({ blobs });
}

export async function DELETE(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { url } = await request.json();
  await del(url);

  return NextResponse.json({ success: true });
}
