import Link from 'next/link';
import Image from 'next/image';
import GalleryGrid from '@/components/GalleryGrid';
import FluentEmoji from '@/components/FluentEmoji';
import { galleryItems, getGalleryBySlug, getGalleryBySeries } from '@/data/gallery';
import { getSeriesById } from '@/data/series';
import { notFound } from 'next/navigation';
import { list } from '@vercel/blob';

export const dynamicParams = true;

export async function generateStaticParams() {
  return galleryItems.map((item) => ({
    slug: item.slug,
  }));
}

// Blob 스토리지에서 직접 동적 갤러리 아이템 조회
async function getDynamicArtwork(slug) {
  try {
    const decodedSlug = decodeURIComponent(slug);
    
    // gallery/ prefix로 모든 blob 이미지 검색
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

    // 파일명에서 slug 매칭
    const matchedBlob = allBlobs
      .filter(blob => blob.pathname.match(/\.(png|jpg|jpeg|webp)$/i))
      .find(blob => {
        const filename = blob.pathname.split('/').pop();
        const blobSlug = filename.replace(/\.[^/.]+$/, '');
        return blobSlug === decodedSlug || encodeURIComponent(blobSlug) === slug;
      });

    if (!matchedBlob) return null;

    const parts = matchedBlob.pathname.split('/');
    const filename = parts[parts.length - 1];
    const blobSeries = parts.length >= 3 ? parts[1] : 'unknown';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    return {
      id: `blob-${blobSeries}-${filename}`,
      slug: filename.replace(/\.[^/.]+$/, ''),
      title,
      titleEn: title,
      series: blobSeries,
      image: matchedBlob.url,
      description: '',
    };
  } catch (e) {
    console.error('getDynamicArtwork error:', e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let artwork = getGalleryBySlug(slug);
  if (!artwork) artwork = await getDynamicArtwork(slug);
  if (!artwork) return {};

  return {
    title: artwork.title,
    description: artwork.description || `${artwork.title} - Artivoya 컬러링`,
    openGraph: {
      title: `${artwork.title} | Artivoya`,
      description: artwork.description || `${artwork.title} - Artivoya 컬러링`,
    },
  };
}

export default async function GalleryDetailPage({ params }) {
  const { slug } = await params;
  let artwork = getGalleryBySlug(slug);
  let isDynamic = false;

  if (!artwork) {
    artwork = await getDynamicArtwork(slug);
    isDynamic = true;
  }

  if (!artwork) {
    notFound();
  }

  const seriesData = getSeriesById(artwork.series);
  
  const relatedArtworks = isDynamic 
    ? [] 
    : getGalleryBySeries(artwork.series).filter((item) => item.id !== artwork.id);

  return (
    <div className="artwork-detail">
      <div className="container">
        <div className="artwork-detail-grid">
          {/* Image */}
          <div className="artwork-image-wrapper">
            {artwork.image ? (
              isDynamic ? (
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f8f8' }}
                />
              ) : (
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'contain', background: '#f8f8f8' }}
                />
              )
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: seriesData ? seriesData.gradient : '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6rem',
                }}
              >
                {seriesData?.icon}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="artwork-info">
            {seriesData && (
              <Link
                href={`/${seriesData.slug}`}
                className="artwork-series-badge"
                style={{ background: seriesData.primaryColor }}
              >
                <FluentEmoji name={seriesData.icon} size={18} /> {seriesData.name}
              </Link>
            )}

            <h1>{artwork.title}</h1>
            {artwork.description && <p>{artwork.description}</p>}

            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              {seriesData && (
                <Link
                  href={`/${seriesData.slug}`}
                  className="btn btn-series"
                  style={{ '--series-color': seriesData.primaryColor }}
                >
                  {seriesData.name} 더 보기
                </Link>
              )}
              <a
                href="https://www.youtube.com/channel/UC063pY3PTB8q8FewhATKtPw"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                ▶ 영상 보기
              </a>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedArtworks.length > 0 && (
          <div className="related-series">
            <h2 className="section-title">같은 시리즈의 다른 작품</h2>
            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <GalleryGrid items={relatedArtworks} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
