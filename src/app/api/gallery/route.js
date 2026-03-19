import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// 공개 API — Blob 스토리지에서 직접 이미지 목록 조회
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get('series');
  const featured = searchParams.get('featured');

  try {
    // 시리즈별 prefix 또는 전체
    const prefix = series ? `gallery/${series}/` : 'gallery/';

    let allBlobs = [];
    let cursor = undefined;
    let hasMore = true;

    while (hasMore) {
      const opts = { limit: 1000, prefix };
      if (cursor) opts.cursor = cursor;
      const result = await list(opts);
      allBlobs = allBlobs.concat(result.blobs);
      cursor = result.cursor;
      hasMore = result.hasMore;
    }

    // Blob을 갤러리 아이템 형태로 변환
    const items = allBlobs
      .filter(blob => blob.pathname.match(/\.(png|jpg|jpeg|webp)$/i))
      .map(blob => {
        const parts = blob.pathname.split('/');
        const filename = parts[parts.length - 1];
        const blobSeries = parts.length >= 3 ? parts[1] : 'unknown';
        const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        return {
          id: `blob-${blobSeries}-${filename}`,
          slug: filename.replace(/\.[^/.]+$/, ''),
          title: title,
          titleEn: title,
          series: blobSeries,
          image: blob.url,
          description: '',
          featured: true, // Blob에 업로드된 이미지는 모두 표시
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        };
      });

    // featured 필터
    let filtered = items;
    if (featured === 'true') {
      filtered = items.filter(item => item.featured);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json([]);
  }
}
