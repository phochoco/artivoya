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
    return NextResponse.json({ error: '인증이 필요합니다.', blobs: [] }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';

    // 전체 목록 로드 (prefix 문제 디버깅)
    let allBlobs = [];
    let cursor = undefined;
    let hasMore = true;

    while (hasMore) {
      const opts = { limit: 1000 };
      if (prefix) opts.prefix = prefix;
      if (cursor) opts.cursor = cursor;
      const result = await list(opts);
      allBlobs = allBlobs.concat(result.blobs);
      cursor = result.cursor;
      hasMore = result.hasMore;
    }

    return NextResponse.json({ 
      blobs: allBlobs, 
      count: allBlobs.length,
      prefix,
      debug: allBlobs.length === 0 ? 'No blobs found with this prefix' : null,
    });
  } catch (error) {
    console.error('Blob list error:', error);
    return NextResponse.json({ error: error.message, blobs: [], stack: error.stack }, { status: 500 });
  }
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
