import { put, head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

const GALLERY_DATA_KEY = 'data/gallery.json';

// 공개 API — 갤러리 데이터 조회
export async function GET() {
  try {
    const blob = await head(GALLERY_DATA_KEY);
    const response = await fetch(blob.url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Blob에 데이터 없으면 빈 배열
    return NextResponse.json([]);
  }
}

// 관리자 전용 — 갤러리 항목 추가/업데이트
export async function POST(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const newItem = await request.json();

  // 기존 데이터 로드
  let items = [];
  try {
    const blob = await head(GALLERY_DATA_KEY);
    const response = await fetch(blob.url);
    items = await response.json();
  } catch {
    items = [];
  }

  // 같은 id가 있으면 업데이트, 없으면 추가
  const existingIndex = items.findIndex(item => item.id === newItem.id);
  if (existingIndex >= 0) {
    items[existingIndex] = { ...items[existingIndex], ...newItem };
  } else {
    items.push(newItem);
  }

  // 저장
  await put(GALLERY_DATA_KEY, JSON.stringify(items, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });

  return NextResponse.json({ success: true, count: items.length });
}

// 관리자 전용 — 갤러리 항목 삭제
export async function DELETE(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await request.json();

  let items = [];
  try {
    const blob = await head(GALLERY_DATA_KEY);
    const response = await fetch(blob.url);
    items = await response.json();
  } catch {
    return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 404 });
  }

  items = items.filter(item => item.id !== id);

  await put(GALLERY_DATA_KEY, JSON.stringify(items, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });

  return NextResponse.json({ success: true, count: items.length });
}
