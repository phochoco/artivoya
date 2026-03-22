'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import ColorPalette from '@/components/ColorPalette';

const SERIES_MAP = {
  'robot': { name: '로봇 시리즈', slug: 'robot-series', color: '#FF6B35' },
  'aquarium': { name: '아쿠아리움 시리즈', slug: 'aquarium-series', color: '#00B4D8' },
  'idol-fairy': { name: '아이돌요정 시리즈', slug: 'idol-fairy-series', color: '#E84393' },
  'safari': { name: '사파리 시리즈', slug: 'safari-series', color: '#F39C12' },
};

// 인라인 하이라이트 오버레이
function HighlightOverlay({ imageUrl, highlightColor, containerRef }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!highlightColor || !img || img.width === 0 || img.height === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const tr = highlightColor.r, tg = highlightColor.g, tb = highlightColor.b;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] < 10) continue;
      const dist = Math.sqrt((data[i]-tr)**2 + (data[i+1]-tg)**2 + (data[i+2]-tb)**2);
      if (dist > 55) {
        // 비선택 영역: 흑백(Grayscale) 전환 마스크
        const luma = Math.round(data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
        data[i] = Math.min(255, luma + 30);
        data[i+1] = Math.min(255, luma + 30);
        data[i+2] = Math.min(255, luma + 30);
        data[i+3] = 255;
      } else {
        // 선택 영역: 투명 뚫기
        data[i+3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [highlightColor, imageUrl]);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', opacity: highlightColor ? 1 : 0,
      transition: 'opacity 0.3s ease', borderRadius: 'inherit', zIndex: 2,
    }} />
  );
}

function GalleryViewContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [highlightColor, setHighlightColor] = useState(null);
  const wrapperRef = useRef(null);

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
          <div className="artwork-image-wrapper" ref={wrapperRef}>
            <img
              src={artwork.image}
              alt={artwork.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f8f8' }}
            />
            <HighlightOverlay
              imageUrl={artwork.image}
              highlightColor={highlightColor}
              containerRef={wrapperRef}
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

          {/* 채색 가이드 */}
          <div className="artwork-info-with-guide">
            <ColorPalette
              imageUrl={artwork.image}
              slug={slug}
              onHighlightColor={setHighlightColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryViewPage() {
  return (
    <Suspense fallback={
      <div className="artwork-detail"><div className="container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <p style={{ color: 'rgba(0,0,0,0.4)' }}>불러오는 중...</p>
      </div></div>
    }>
      <GalleryViewContent />
    </Suspense>
  );
}
