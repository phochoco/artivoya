'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import ColorPalette from '@/components/ColorPalette';
import ColorHighlight from '@/components/ColorHighlight';

const SERIES_MAP = {
  'robot': { name: '로봇 시리즈', slug: 'robot-series', color: '#FF6B35' },
  'aquarium': { name: '아쿠아리움 시리즈', slug: 'aquarium-series', color: '#00B4D8' },
  'idol-fairy': { name: '아이돌요정 시리즈', slug: 'idol-fairy-series', color: '#E84393' },
  'safari': { name: '사파리 시리즈', slug: 'safari-series', color: '#F39C12' },
};

function GalleryViewContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [highlightColor, setHighlightColor] = useState(null);

  useEffect(() => {
    if (!slug) { setError(true); setLoading(false); return; }
    fetch(`/api/gallery/item?slug=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setArtwork(data);
        else setError(true);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="artwork-detail">
        <div className="container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
          <p style={{ color: 'rgba(0,0,0,0.4)' }}>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="artwork-detail">
        <div className="container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
          <h2>작품을 찾을 수 없습니다</h2>
          <Link href="/" className="btn btn-series" style={{ marginTop: '2rem', display: 'inline-block' }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const seriesInfo = SERIES_MAP[artwork.series];

  return (
    <div className="artwork-detail">
      <div className="container">
        <div className="artwork-detail-grid">
          {/* 이미지 + 하이라이트 */}
          <div className="artwork-image-wrapper">
            <ColorHighlight imageUrl={artwork.image} highlightColor={highlightColor}>
              <img
                src={artwork.image}
                alt={artwork.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f8f8' }}
              />
            </ColorHighlight>
          </div>

          {/* 채색 가이드 (팔레트 + AI + 단계별) */}
          <div className="artwork-info-with-guide">
            <ColorPalette
              imageUrl={artwork.image}
              slug={slug}
              onHighlightColor={setHighlightColor}
            />
          </div>

          {/* 작품 정보 */}
          <div className="artwork-info">
            {seriesInfo && (
              <Link href={`/${seriesInfo.slug}`} className="artwork-series-badge" style={{ background: seriesInfo.color }}>
                {seriesInfo.name}
              </Link>
            )}
            <h1>{artwork.title}</h1>
            {artwork.description && <p>{artwork.description}</p>}
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              {seriesInfo && (
                <Link href={`/${seriesInfo.slug}`} className="btn btn-series" style={{ '--series-color': seriesInfo.color }}>
                  {seriesInfo.name} 더 보기
                </Link>
              )}
              <a href="https://www.youtube.com/channel/UC063pY3PTB8q8FewhATKtPw" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                ▶ 영상 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryViewPage() {
  return (
    <Suspense fallback={
      <div className="artwork-detail">
        <div className="container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
          <p style={{ color: 'rgba(0,0,0,0.4)' }}>불러오는 중...</p>
        </div>
      </div>
    }>
      <GalleryViewContent />
    </Suspense>
  );
}
