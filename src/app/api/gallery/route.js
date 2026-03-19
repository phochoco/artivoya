import { head } from '@vercel/blob';
import { NextResponse } from 'next/server';

const GALLERY_DATA_KEY = 'data/gallery.json';

// 공개 API — Blob에 저장된 갤러리 데이터 조회
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get('series');
  const featured = searchParams.get('featured');

  try {
    const blob = await head(GALLERY_DATA_KEY);
    const response = await fetch(blob.url);
    let items = await response.json();

    if (series) {
      items = items.filter(item => item.series === series);
    }
    if (featured === 'true') {
      items = items.filter(item => item.featured);
    }

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
