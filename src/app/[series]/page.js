import Link from 'next/link';
import SeriesCard from '@/components/SeriesCard';
import GalleryGrid from '@/components/GalleryGrid';
import VideoEmbed from '@/components/VideoEmbed';
import { series, getSeriesBySlug } from '@/data/series';
import { getGalleryBySeries } from '@/data/gallery';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return series.map((s) => ({
    series: s.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { series: slug } = await params;
  const seriesData = getSeriesBySlug(slug);
  if (!seriesData) return {};

  return {
    title: `${seriesData.name} — ${seriesData.nameEn}`,
    description: seriesData.description,
    openGraph: {
      title: `${seriesData.name} | Artivoya`,
      description: seriesData.description,
    },
  };
}

export default async function SeriesPage({ params }) {
  const { series: slug } = await params;
  const seriesData = getSeriesBySlug(slug);

  if (!seriesData) {
    notFound();
  }

  const artworks = getGalleryBySeries(seriesData.id);
  const otherSeries = series.filter((s) => s.id !== seriesData.id);

  return (
    <>
      {/* Series Hero */}
      <section className="series-hero">
        <div
          className="series-hero-bg"
          style={{ background: seriesData.gradient }}
        />
        <div className="series-hero-content">
          <div className="series-icon">{seriesData.icon}</div>
          <h1>{seriesData.name}</h1>
          <p>{seriesData.description}</p>
        </div>
      </section>

      {/* Gallery */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">채색 갤러리</h2>
          <p className="section-subtitle">{seriesData.tagline}</p>
          <GalleryGrid items={artworks} />
        </div>
      </section>

      {/* Videos */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <h2 className="section-title">채색 영상</h2>
          <p className="section-subtitle">
            {seriesData.name}의 채색 과정을 영상으로 만나보세요
          </p>
          <div className="video-grid">
            <VideoEmbed videoId="dQw4w9WgXcQ" title={`${seriesData.name} 채색 과정`} />
          </div>
        </div>
      </section>

      {/* Related Series */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">다른 시리즈도 만나보세요</h2>
          <p className="section-subtitle">
            Artivoya의 다양한 세계관을 탐험해보세요
          </p>
          <div className="related-grid">
            {otherSeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
