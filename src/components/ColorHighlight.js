'use client';

import { useRef, useEffect, useState } from 'react';

// 선택된 색상과 이미지 픽셀의 유사도를 기반으로 하이라이트 오버레이 생성
export default function ColorHighlight({ imageUrl, highlightColor, children }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // 이미지 프리로드
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 하이라이트 오버레이 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (!highlightColor) {
      // 하이라이트 없으면 투명
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 이미지를 canvas에 그리기
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    const w = img.width * scale;
    const h = img.height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const tr = highlightColor.r;
    const tg = highlightColor.g;
    const tb = highlightColor.b;
    const threshold = 55; // 색상 거리 임계값

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      
      if (a < 10) continue; // 투명 픽셀 skip

      const dist = Math.sqrt(
        (r - tr) * (r - tr) +
        (g - tg) * (g - tg) +
        (b - tb) * (b - tb)
      );

      if (dist > threshold) {
        // 매칭되지 않는 영역 → 반투명 어두운 오버레이
        data[i] = Math.round(r * 0.3);
        data[i + 1] = Math.round(g * 0.3);
        data[i + 2] = Math.round(b * 0.3);
        data[i + 3] = 180;
      } else {
        // 매칭되는 영역 → 완전 투명 (원본 이미지가 보이도록)
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [highlightColor, imgLoaded]);

  // 리사이즈 대응
  useEffect(() => {
    if (!highlightColor || !imgLoaded) return;
    const handleResize = () => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
      // 트리거: 리렌더
      setImgLoaded(false);
      setTimeout(() => setImgLoaded(true), 50);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [highlightColor, imgLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <canvas
        ref={canvasRef}
        className="color-highlight-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: highlightColor ? 1 : 0,
          transition: 'opacity 0.3s ease',
          borderRadius: 'inherit',
        }}
      />
    </div>
  );
}
