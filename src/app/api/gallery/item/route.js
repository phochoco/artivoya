import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// 공개 API — slug로 갤러리 아이템 하나 조회
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  try {
    // NFC로 정규화 (macOS NFD 파일명 호환)
    const normalizedSlug = slug.normalize('NFC');

    let allBlobs = [];
    let cursor = undefined;
    let hasMore = true;

    while (hasMore) {
      const opts = { limit: 1000, prefix: 'gallery/' };
      if (cursor) opts.cursor = cursor;
      const result = await list(opts);
      allBlobs = allBlobs.concat(result.blobs);
      cursor = result.cursor;
      hasMore = result.hasMore;
    }

    const matchedBlob = allBlobs
      .filter(blob => blob.pathname.match(/\.(png|jpg|jpeg|webp)$/i))
      .find(blob => {
        const filename = blob.pathname.split('/').pop();
        const blobSlug = filename.replace(/\.[^/.]+$/, '');
        // NFC와 NFD 양쪽 비교
        const blobSlugNFC = blobSlug.normalize('NFC');
        return blobSlugNFC === normalizedSlug 
            || blobSlug === slug 
            || blobSlug === normalizedSlug;
      });

    if (!matchedBlob) {
      return NextResponse.json(null);
    }

    const parts = matchedBlob.pathname.split('/');
    const filename = parts[parts.length - 1];
    const blobSeries = parts.length >= 3 ? parts[1] : 'unknown';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').normalize('NFC');

    return NextResponse.json({
      id: `blob-${blobSeries}-${filename}`,
      slug: filename.replace(/\.[^/.]+$/, ''),
      title,
      titleEn: title,
      series: blobSeries,
      image: matchedBlob.url,
      description: '',
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
