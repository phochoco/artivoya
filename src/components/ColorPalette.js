'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Median-cut 컬러 양자화 ──
function getPixels(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 150 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
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
    for (const p of pixels) { avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2]; }
    return [{ color: [Math.round(avg[0]/pixels.length), Math.round(avg[1]/pixels.length), Math.round(avg[2]/pixels.length)], count: pixels.length }];
  }
  let rMin=255,rMax=0,gMin=255,gMax=0,bMin=255,bMax=0;
  for (const [r,g,b] of pixels) { if(r<rMin)rMin=r;if(r>rMax)rMax=r;if(g<gMin)gMin=g;if(g>gMax)gMax=g;if(b<bMin)bMin=b;if(b>bMax)bMax=b; }
  const rR=rMax-rMin,gR=gMax-gMin,bR=bMax-bMin;
  let ch=0; if(gR>=rR&&gR>=bR)ch=1; else if(bR>=rR&&bR>=gR)ch=2;
  pixels.sort((a,b)=>a[ch]-b[ch]);
  const mid=Math.floor(pixels.length/2);
  return [...medianCut(pixels.slice(0,mid),depth-1),...medianCut(pixels.slice(mid),depth-1)];
}

function rgbToHex(r,g,b) { return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join(''); }

function getColorName(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (l < 15) return '검정';
  if (l > 90 && s < 10) return '흰색';
  if (s < 12) { if (l<40) return '진한 회색'; if (l<70) return '회색'; return '밝은 회색'; }
  let name = '';
  if (h<15||h>=345) name='빨강'; else if(h<35)name='주황'; else if(h<55)name='노랑';
  else if(h<80)name='연두'; else if(h<160)name='초록'; else if(h<195)name='청록';
  else if(h<250)name='파랑'; else if(h<290)name='보라'; else name='분홍';
  if (l<35) return '진한 '+name; if (l>70) return '밝은 '+name; return name;
}

function rgbToHsl(r,g,b) {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b); let h,s,l=(max+min)/2;
  if(max===min){h=s=0}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
  switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
}

function deduplicateColors(colors, threshold=30) {
  const result=[];
  for(const c of colors){const isDupe=result.some(r=>{const dr=r.color[0]-c.color[0],dg=r.color[1]-c.color[1],db=r.color[2]-c.color[2];return Math.sqrt(dr*dr+dg*dg+db*db)<threshold;});if(!isDupe)result.push(c);}
  return result;
}

// ── 단계별 채색 가이드 생성 ──
function generateStepGuide(colors) {
  if (colors.length === 0) return [];
  const light = colors.filter(c => rgbToHsl(c.r,c.g,c.b)[2] > 65);
  const mid = colors.filter(c => { const l=rgbToHsl(c.r,c.g,c.b)[2]; return l>=30&&l<=65; });
  const dark = colors.filter(c => rgbToHsl(c.r,c.g,c.b)[2] < 30);
  const steps = [];
  if (light.length > 0) steps.push({ step: 1, title: '배경 & 밝은 영역부터', desc: '가장 밝은 색으로 넓은 면적부터 가볍게 칠해주세요. 색연필은 살짝 눕혀서 부드럽게 칠하면 좋아요.', colors: light });
  if (mid.length > 0) steps.push({ step: steps.length+1, title: '주요 색상 채우기', desc: '캐릭터와 주요 오브젝트에 중간 톤 색상을 채워주세요. 윤곽선 안쪽으로 한 방향으로 칠하면 깔끔해요.', colors: mid });
  if (dark.length > 0) steps.push({ step: steps.length+1, title: '그림자 & 디테일', desc: '진한 색으로 그림자, 눈동자, 윤곽 등 세부 디테일을 마무리하세요. 힘을 주어 진하게 칠하면 입체감이 살아요.', colors: dark });
  steps.push({ step: steps.length+1, title: '마무리 터치', desc: '색이 겹치는 경계 부분을 부드럽게 블렌딩하고, 하이라이트 부분은 빈 공간으로 남겨두면 빛 표현이 돼요.', colors: [] });
  return steps;
}

// ── 컴포넌트 ──
export default function ColorPalette({ imageUrl, slug, maxColors = 10, customTip, onHighlightColor }) {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [steps, setSteps] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    setLoading(true);
    setSelectedColor(null);

    getPixels(imageUrl)
      .then(pixels => {
        if (pixels.length === 0) { setColors([]); setSteps([]); setLoading(false); return; }
        let extracted = medianCut([...pixels], 4);
        extracted.sort((a, b) => b.count - a.count);
        extracted = deduplicateColors(extracted);
        extracted = extracted.slice(0, maxColors);

        const palette = extracted.map(({ color, count }) => {
          const [r, g, b] = color;
          return { hex: rgbToHex(r,g,b), rgb: `${r}, ${g}, ${b}`, name: getColorName(r,g,b), r, g, b, count };
        });

        setColors(palette);
        setSteps(generateStepGuide(palette));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [imageUrl, maxColors]);

  // AI 분석 로드
  useEffect(() => {
    if (!slug || !imageUrl) return;
    setAiLoading(true);
    setAiError(false);

    fetch(`/api/gallery/analyze?slug=${encodeURIComponent(slug)}&imageUrl=${encodeURIComponent(imageUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (data.analysis) {
          setAiAnalysis(data.analysis);
        } else {
          setAiError(true);
        }
        setAiLoading(false);
      })
      .catch(() => { setAiError(true); setAiLoading(false); });
  }, [slug, imageUrl]);

  const handleColorClick = useCallback((index) => {
    const newIndex = selectedColor === index ? null : index;
    setSelectedColor(newIndex);
    if (onHighlightColor) {
      onHighlightColor(newIndex !== null ? colors[newIndex] : null);
    }
  }, [selectedColor, colors, onHighlightColor]);

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
      {/* 컬러칩 */}
      <h3 className="color-palette-title">🎨 사용된 색상</h3>
      <p className="color-palette-sub">색상을 탭하면 이미지에서 해당 색이 사용된 부분이 강조돼요</p>
      <div className="color-chips">
        {colors.map((c, i) => (
          <button
            key={i}
            className={`color-chip ${selectedColor === i ? 'active' : ''}`}
            style={{ background: c.hex }}
            onClick={() => handleColorClick(i)}
            title={c.name}
          >
            <span className="color-chip-inner" />
          </button>
        ))}
      </div>

      {selectedColor !== null && colors[selectedColor] && (
        <div className="color-detail">
          <div className="color-detail-swatch" style={{ background: colors[selectedColor].hex }} />
          <div className="color-detail-info">
            <span className="color-detail-name">{colors[selectedColor].name}</span>
            <span className="color-detail-hex">{colors[selectedColor].hex.toUpperCase()}</span>
            <span className="color-detail-rgb">RGB({colors[selectedColor].rgb})</span>
          </div>
        </div>
      )}

      {/* 관리자 수동 팁 */}
      {customTip && (
        <div className="coloring-tips" style={{ marginTop: 'var(--space-lg)' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.65)', margin: 0 }}>{customTip}</p>
        </div>
      )}

      {/* AI 채색 분석 */}
      {(aiAnalysis || aiLoading) && (
        <div className="ai-analysis">
          <h3 className="ai-analysis-title">🤖 AI 부위별 채색 가이드</h3>
          {aiLoading ? (
            <div className="ai-analysis-loading">
              <span className="ai-spinner" />
              AI가 이미지를 분석하고 있어요...
            </div>
          ) : aiAnalysis && (
            <div className="ai-analysis-list">
              {aiAnalysis.map((item, i) => (
                <div key={i} className="ai-part-card">
                  <div className="ai-part-header">
                    <span className="ai-part-number">{i + 1}</span>
                    <span className="ai-part-name">{item.part}</span>
                  </div>
                  <div className="ai-part-colors">{item.colors}</div>
                  <div className="ai-part-tip">💡 {item.tip}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 단계별 가이드 */}
      {steps.length > 0 && (
        <div className="step-guide">
          <h3 className="step-guide-title">✏️ 채색 순서 가이드</h3>
          <div className="step-guide-steps">
            {steps.map((s) => (
              <div key={s.step} className="step-card">
                <div className="step-card-header">
                  <span className="step-number">STEP {s.step}</span>
                  <span className="step-title">{s.title}</span>
                </div>
                <p className="step-desc">{s.desc}</p>
                {s.colors.length > 0 && (
                  <div className="step-colors">
                    {s.colors.map((c, i) => (
                      <div key={i} className="step-color-item">
                        <span className="step-color-dot" style={{ background: c.hex }} />
                        <span className="step-color-name">{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
