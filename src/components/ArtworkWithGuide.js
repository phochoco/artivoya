'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ColorPalette from './ColorPalette';

// Canvas 하이라이트 오버레이 (가볍게 내장)
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
    const container = containerRef.current;
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

    // 이미지를 contain 모드로 그리기
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const tr = highlightColor.r, tg = highlightColor.g, tb = highlightColor.b;
    const threshold = 55;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 10) continue;
      const dist = Math.sqrt(
        (data[i] - tr) ** 2 + (data[i+1] - tg) ** 2 + (data[i+2] - tb) ** 2
      );
      if (dist > threshold) {
        // 비선택 영역: 흑백(Grayscale)으로 워시아웃(Wash-out)하여 타블렛 스케치처럼 매우 연하게 날림
        // 어두운 색상(갈색 등)도 눈에 띄도록 대비를 극대화
        const luma = Math.round(data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
        const washedLuma = Math.min(255, 180 + Math.floor(luma * 0.3));
        data[i] = washedLuma; 
        data[i+1] = washedLuma;
        data[i+2] = washedLuma;
        data[i+3] = 255;
      } else {
        // 선택 영역: 마스크를 투명(0)하게 뚫어서 밑의 원본 이미지 (컬러)가 그대로 보이게 함
        data[i+3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [highlightColor, imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
        opacity: highlightColor ? 1 : 0,
        transition: 'opacity 0.3s ease',
        borderRadius: 'inherit',
        zIndex: 2,
      }}
    />
  );
}

export default function ArtworkWithGuide({ imageUrl, slug, customTip, children }) {
  const [highlightColor, setHighlightColor] = useState(null);
  const wrapperRef = useRef(null);

  return (
    <>
      <div className="artwork-image-wrapper" ref={wrapperRef}>
        {children}
        <HighlightOverlay
          imageUrl={imageUrl}
          highlightColor={highlightColor}
          containerRef={wrapperRef}
        />
      </div>
      <div className="artwork-info-with-guide">
        <ColorPalette
          imageUrl={imageUrl}
          slug={slug}
          customTip={customTip}
          onHighlightColor={setHighlightColor}
        />
      </div>
    </>
  );
}
