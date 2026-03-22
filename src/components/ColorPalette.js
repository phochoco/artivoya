'use client';

import { useState, useEffect, useRef } from 'react';

// ── Median-cut 컬러 양자화 ──
function getPixels(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 성능을 위해 축소 샘플링
      const scale = Math.min(1, 150 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        // 투명/거의 흰색/거의 검정 제외
        if (a < 128) continue;
        if (r > 240 && g > 240 && b > 240) continue;
        if (r < 15 && g < 15 && b < 15) continue;
        pixels.push([r, g, b]);
      }
      resolve(pixels);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

function medianCut(pixels, depth) {
  if (depth === 0 || pixels.length === 0) {
    if (pixels.length === 0) return [];
    const avg = [0, 0, 0];
    for (const p of pixels) {
      avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2];
    }
    return [{ 
      color: [
        Math.round(avg[0] / pixels.length),
        Math.round(avg[1] / pixels.length),
        Math.round(avg[2] / pixels.length),
      ],
      count: pixels.length,
    }];
  }

  // 각 채널의 범위 계산
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r; if (r > rMax) rMax = r;
    if (g < gMin) gMin = g; if (g > gMax) gMax = g;
    if (b < bMin) bMin = b; if (b > bMax) bMax = b;
  }

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  // 가장 큰 범위의 채널로 정렬 후 분할
  let channel = 0;
  if (gRange >= rRange && gRange >= bRange) channel = 1;
  else if (bRange >= rRange && bRange >= gRange) channel = 2;

  pixels.sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(pixels.length / 2);

  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// 색상 이름 근사값
function getColorName(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  const h = hsl[0], s = hsl[1], l = hsl[2];

  if (l < 15) return '검정';
  if (l > 90 && s < 10) return '흰색';
  if (s < 12) {
    if (l < 40) return '진한 회색';
    if (l < 70) return '회색';
    return '밝은 회색';
  }

  let name = '';
  if (h < 15 || h >= 345) name = '빨강';
  else if (h < 35) name = '주황';
  else if (h < 55) name = '노랑';
  else if (h < 80) name = '연두';
  else if (h < 160) name = '초록';
  else if (h < 195) name = '청록';
  else if (h < 250) name = '파랑';
  else if (h < 290) name = '보라';
  else name = '분홍';

  if (l < 35) return '진한 ' + name;
  if (l > 70) return '밝은 ' + name;
  return name;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// 비슷한 색 제거
function deduplicateColors(colors, threshold = 30) {
  const result = [];
  for (const c of colors) {
    const isDupe = result.some(r => {
      const dr = r.color[0] - c.color[0];
      const dg = r.color[1] - c.color[1];
      const db = r.color[2] - c.color[2];
      return Math.sqrt(dr*dr + dg*dg + db*db) < threshold;
    });
    if (!isDupe) result.push(c);
  }
  return result;
}

// ── 컴포넌트 ──
export default function ColorPalette({ imageUrl, maxColors = 10 }) {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;
    setLoading(true);
    setSelectedColor(null);

    getPixels(imageUrl)
      .then(pixels => {
        if (pixels.length === 0) {
          setColors([]);
          setLoading(false);
          return;
        }

        // depth 4 → 최대 16색 추출 후 정리
        let extracted = medianCut([...pixels], 4);
        extracted.sort((a, b) => b.count - a.count);
        extracted = deduplicateColors(extracted);
        extracted = extracted.slice(0, maxColors);

        const palette = extracted.map(({ color, count }) => {
          const [r, g, b] = color;
          return {
            hex: rgbToHex(r, g, b),
            rgb: `${r}, ${g}, ${b}`,
            name: getColorName(r, g, b),
            r, g, b,
            count,
          };
        });

        setColors(palette);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [imageUrl, maxColors]);

  if (loading) {
    return (
      <div className="color-palette">
        <h3 className="color-palette-title">🎨 사용된 색상</h3>
        <div className="color-palette-loading">분석 중...</div>
      </div>
    );
  }

  if (colors.length === 0) return null;

  return (
    <div className="color-palette">
      <h3 className="color-palette-title">🎨 사용된 색상</h3>
      <div className="color-chips">
        {colors.map((c, i) => (
          <button
            key={i}
            className={`color-chip ${selectedColor === i ? 'active' : ''}`}
            style={{ background: c.hex }}
            onClick={() => setSelectedColor(selectedColor === i ? null : i)}
            title={c.name}
          >
            <span className="color-chip-inner" />
          </button>
        ))}
      </div>

      {selectedColor !== null && colors[selectedColor] && (
        <div className="color-detail">
          <div
            className="color-detail-swatch"
            style={{ background: colors[selectedColor].hex }}
          />
          <div className="color-detail-info">
            <span className="color-detail-name">{colors[selectedColor].name}</span>
            <span className="color-detail-hex">{colors[selectedColor].hex.toUpperCase()}</span>
            <span className="color-detail-rgb">RGB({colors[selectedColor].rgb})</span>
          </div>
        </div>
      )}

      <p className="color-palette-hint">
        💡 색상을 탭하면 색상명과 코드를 확인할 수 있어요
      </p>
    </div>
  );
}
