import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

const BLOB_PATH = 'config/videos.json';

// Blob에서 videos.json 로드
async function loadVideos() {
  try {
    const { blobs } = await list({ prefix: 'config/' });
    const videoBlob = blobs.find(b => b.pathname === BLOB_PATH || b.pathname.includes('videos.json'));
    
    if (!videoBlob) {
      return [];
    }

    const res = await fetch(videoBlob.url, { cache: 'no-store' });
    const videos = await res.json();
    return videos;
  } catch (e) {
    return [];
  }
}

// 비디오 목록 가져오기 (GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get('series');

  const videos = await loadVideos();

  if (series) {
    return NextResponse.json(videos.filter(v => v.series === series));
  }
  return NextResponse.json(videos);
}

// 비디오 추가 (POST)
export async function POST(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { videoId, title, series, isShorts } = body;

  if (!videoId || !title || !series) {
    return NextResponse.json({ error: 'videoId, title, series 필수' }, { status: 400 });
  }

  try {
    const videos = await loadVideos();

    const newVideo = {
      id: `video-${Date.now()}`,
      videoId,
      title,
      series,
      isShorts: isShorts || false,
      createdAt: new Date().toISOString(),
    };
    videos.push(newVideo);

    await put(BLOB_PATH, JSON.stringify(videos, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true, video: newVideo });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 비디오 삭제 (DELETE)
export async function DELETE(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  try {
    let videos = await loadVideos();
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
