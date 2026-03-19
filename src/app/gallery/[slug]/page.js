import Link from 'next/link';
import Image from 'next/image';
import GalleryGrid from '@/components/GalleryGrid';
import FluentEmoji from '@/components/FluentEmoji';
import { galleryItems, getGalleryBySlug, getGalleryBySeries } from '@/data/gallery';
import { getSeriesById } from '@/data/series';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return galleryItems.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artwork = getGalleryBySlug(slug);
  if (!artwork) return {};

  return {
    title: artwork.title,
    description: artwork.description,
    openGraph: {
      title: `${artwork.title} | Artivoya`,
      description: artwork.description,
    },
  };
}

export default async function GalleryDetailPage({ params }) {
  const { slug } = await params;
  const artwork = getGalleryBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const seriesData = getSeriesById(artwork.series);
  const relatedArtworks = getGalleryBySeries(artwork.series).filter(
    (item) => item.id !== artwork.id
  );

  return (
    <div className="artwork-detail">
      <div className="container">
        <div className="artwork-detail-grid">
          {/* Image */}
          <div className="artwork-image-wrapper">
            {artwork.image ? (
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain', background: '#f8f8f8' }}
              />
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
            <p>{artwork.description}</p>

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
