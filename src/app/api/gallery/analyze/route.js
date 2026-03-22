import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CACHE_PREFIX = 'analysis/';

// Blob 캐시에서 분석 결과 조회
async function getCachedAnalysis(slug) {
  try {
    const { blobs } = await list({ prefix: `${CACHE_PREFIX}${slug}.json` });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      return await res.json();
    }
  } catch (e) {
    // 캐시 없음
  }
  return null;
}

// Blob에 분석 결과 캐싱
async function cacheAnalysis(slug, data) {
  try {
    await put(
      `${CACHE_PREFIX}${slug}.json`,
      JSON.stringify(data),
      { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' }
    );
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

// Gemini Vision API 호출
async function analyzeWithGemini(imageUrl) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  // 이미지를 base64로 변환
  const imgRes = await fetch(imageUrl);
  const imgBuffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(imgBuffer).toString('base64');
  const mimeType = imgRes.headers.get('content-type') || 'image/png';

  const prompt = `이 채색 완성 이미지를 분석하여, 색칠을 처음 하는 사람이 따라 칠할 수 있도록 부위별 채색 가이드를 작성해주세요.

다음 형식으로 JSON 배열을 반환해주세요:
[
  {
    "part": "부위 이름 (예: 물고기 몸통)",
    "colors": "사용된 색상 설명 (예: 노란색과 검정색 줄무늬)",
    "tip": "채색 팁 (예: 노란색을 먼저 칠하고 검정 줄무늬를 그 위에 덧칠하세요)"
  }
]

규칙:
- 한국어로 작성
- 가장 큰 영역부터 순서대로 (배경 → 주요 캐릭터 → 세부 디테일)
- 각 부위에 사용된 정확한 색상을 설명
- 초등학생도 이해할 수 있게 쉽고 친근한 말투
- 최소 4개, 최대 8개 부위
- JSON 배열만 반환 (마크다운 코드블록 없이)`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              }
            },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error('Empty response from Gemini');

  // JSON 파싱 (마크다운 코드블록 제거)
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const imageUrl = searchParams.get('imageUrl');

  if (!slug || !imageUrl) {
    return NextResponse.json({ error: 'slug and imageUrl required' }, { status: 400 });
  }

  // 1. 캐시 확인
  const cached = await getCachedAnalysis(slug);
  if (cached) {
    return NextResponse.json({ analysis: cached, cached: true });
  }

  // 2. Gemini 분석
  try {
    const analysis = await analyzeWithGemini(decodeURIComponent(imageUrl));
    
    // 3. 캐싱
    await cacheAnalysis(slug, analysis);

    return NextResponse.json({ analysis, cached: false });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
