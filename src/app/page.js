import Link from 'next/link';
import SeriesCard from '@/components/SeriesCard';
import GalleryGrid from '@/components/GalleryGrid';
import VideoEmbed from '@/components/VideoEmbed';
import { series } from '@/data/series';
import { getFeaturedGallery } from '@/data/gallery';

export default function Home() {
  const featuredArtworks = getFeaturedGallery();

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-shapes">
          <div className="shape" />
          <div className="shape" />
          <div className="shape" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            ✨ 프리미엄 컬러링북 브랜드
          </div>
          <h1>
            단순한 선이
            <br />
            <span>작품으로 완성</span>되는 순간
          </h1>
          <p>
            로봇, 아쿠아리움, 아이돌요정, 사파리 —
            <br />
            다양한 세계관을 색으로 채우는 즐거움을 경험하세요.
          </p>
          <div className="hero-cta">
            <Link href="#series" className="btn btn-primary">
              시리즈 탐색하기 →
            </Link>
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
      </section>

      {/* Series Section */}
      <section id="series" className="section">
        <div className="container">
          <h2 className="section-title">시리즈 컬렉션</h2>
          <p className="section-subtitle">
            각각의 세계관 속으로, 나만의 색을 입혀보세요
          </p>
          <div className="series-grid">
            {series.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <h2 className="section-title">채색 갤러리</h2>
          <p className="section-subtitle">
            완성된 작품들을 감상해보세요
          </p>
          <GalleryGrid items={featuredArtworks} />
        </div>
      </section>

      {/* Video Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">움직이는 컬러링</h2>
          <p className="section-subtitle">
            채색한 작품이 살아 움직입니다. 나만의 캐릭터에 생명을 불어넣어 보세요
          </p>
          <div className="video-grid">
            <VideoEmbed videoId="K9FozMS5uxE" title="타이탄너클 움직이는 컬러링" isShorts />
            <VideoEmbed videoId="aMn2o675cK8" title="다이노팡 움직이는 컬러링" isShorts />
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
            <a
              href="https://www.youtube.com/channel/UC063pY3PTB8q8FewhATKtPw"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              YouTube에서 더 보기 →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #533483 100%)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 'var(--space-md)' }}>
            나만의 컬러링을 시작해보세요
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '500px',
              margin: '0 auto var(--space-2xl)',
              fontSize: '1.1rem',
            }}
          >
            쿠팡에서 Artivoya 컬러링북을 만나보세요.
            <br />
            펜을 들고, 당신만의 작품을 완성하세요.
          </p>
          <Link href="/about" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
            브랜드 스토리 보기
          </Link>
        </div>
      </section>
    </>
  );
}
