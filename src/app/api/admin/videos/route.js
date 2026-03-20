import { put, list } from '@vercel/blob';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BLOB_PATH = 'config/videos.json';

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get('admin_auth')?.value === 'true';
}

// 비디오 목록 가져오기
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get('series'); // optional filter

  try {
    // videos.json 찾기
    const { blobs } = await list({ prefix: BLOB_PATH });
    
    if (blobs.length === 0) {
      return NextResponse.json([]);
    }

    const res = await fetch(blobs[0].url);
    const videos = await res.json();

    if (series) {
      return NextResponse.json(videos.filter(v => v.series === series));
    }
    return NextResponse.json(videos);
  } catch (e) {
    return NextResponse.json([]);
  }
}

// 비디오 추가/수정
export async function POST(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { videoId, title, series, isShorts } = body;

  if (!videoId || !title || !series) {
    return NextResponse.json({ error: 'videoId, title, series 필수' }, { status: 400 });
  }

  try {
    // 기존 데이터 로드
    let videos = [];
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      videos = await res.json();
    }

    // 새 비디오 추가
    const newVideo = {
      id: `video-${Date.now()}`,
      videoId,
      title,
      series,
      isShorts: isShorts || false,
      createdAt: new Date().toISOString(),
    };
    videos.push(newVideo);

    // 저장
    await put(BLOB_PATH, JSON.stringify(videos, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json(newVideo);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 비디오 삭제
export async function DELETE(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  try {
    let videos = [];
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      videos = await res.json();
    }

    videos = videos.filter(v => v.id !== id);

    await put(BLOB_PATH, JSON.stringify(videos, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
