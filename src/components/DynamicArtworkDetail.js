'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { series } from '@/data/series';

export default function DynamicArtworkDetail({ slug }) {
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/gallery/item?slug=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setArtwork(data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
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
          <p style={{ marginTop: '1rem', color: 'rgba(0,0,0,0.5)' }}>
            요청하신 작품이 존재하지 않습니다.
          </p>
          <Link href="/" className="btn btn-series" style={{ marginTop: '2rem', display: 'inline-block' }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const seriesData = series.find(s => s.id === artwork.series || s.slug === artwork.series);

  return (
    <div className="artwork-detail">
      <div className="container">
        <div className="artwork-detail-grid">
          {/* Image */}
          <div className="artwork-image-wrapper">
            <img
              src={artwork.image}
              alt={artwork.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f8f8' }}
            />
          </div>

          {/* Info */}
          <div className="artwork-info">
            {seriesData && (
              <Link
                href={`/${seriesData.slug}`}
                className="artwork-series-badge"
                style={{ background: seriesData.primaryColor }}
              >
                {seriesData.name}
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
      </div>
    </div>
  );
}
