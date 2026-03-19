'use client';

import { useState, useEffect, useCallback } from 'react';

const SERIES_LIST = [
  { id: 'robot', name: '로봇 시리즈' },
  { id: 'aquarium', name: '아쿠아리움 시리즈' },
  { id: 'idol-fairy', name: '아이돌요정 시리즈' },
  { id: 'safari', name: '사파리 시리즈' },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedSeries, setSelectedSeries] = useState('robot');
  const [uploadType, setUploadType] = useState('gallery');
  const [uploading, setUploading] = useState(false);
  const [blobs, setBlobs] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // 업로드 + 갤러리 등록 통합 폼
  const [previewFiles, setPreviewFiles] = useState([]); // { file, preview, title, titleEn, description, featured }
  const [uploadStep, setUploadStep] = useState('select'); // 'select' | 'info' | 'done'
  const [uploadResults, setUploadResults] = useState([]);

  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => { setIsAuthenticated(data.authenticated); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setIsAuthenticated(true); setPassword(''); }
    else setError('비밀번호가 올바르지 않습니다.');
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const [debugInfo, setDebugInfo] = useState(null);

  const loadBlobs = useCallback(async (showAll = false) => {
    const prefix = showAll ? '' : (uploadType === 'thumbnail' ? 'series/' : `gallery/${selectedSeries}/`);
    const res = await fetch(`/api/admin/upload?prefix=${prefix}`);
    if (res.status === 401) {
      setIsAuthenticated(false);
      return;
    }
    const data = await res.json();
    setDebugInfo({ count: data.count, prefix: data.prefix, error: data.error, debug: data.debug });
    if (data.error) {
      console.error('Blob load error:', data.error);
    }
    setBlobs(data.blobs || []);
  }, [selectedSeries, uploadType]);

  const [galleryItems, setGalleryItems] = useState([]);

  const loadGalleryItems = useCallback(async () => {
    const res = await fetch(`/api/gallery?series=${selectedSeries}`);
    const data = await res.json();
    setGalleryItems(data);
  }, [selectedSeries]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'manage') {
      loadBlobs();
      loadGalleryItems();
    }
  }, [isAuthenticated, selectedSeries, uploadType, activeTab, loadBlobs, loadGalleryItems]);

  // 파일 선택 → 미리보기 생성
  const handleFilesSelected = (files) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    const previews = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      titleEn: '',
      description: '',
      featured: false,
    }));
    setPreviewFiles(previews);
    setUploadStep('info');
  };

  // 미리보기 항목 수정
  const updatePreviewItem = (index, field, value) => {
    setPreviewFiles(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // 미리보기 항목 삭제
  const removePreviewItem = (index) => {
    setPreviewFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setUploadStep('select');
      return updated;
    });
  };

  // 업로드 + 갤러리 등록
  const handleUploadAll = async () => {
    setUploading(true);
    const results = [];

    for (const item of previewFiles) {
      // 1. 이미지 업로드
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('series', selectedSeries);
      formData.append('type', uploadType);

      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      // 2. 갤러리 항목 등록 (갤러리 타입일 때만)
      if (uploadType === 'gallery' && item.title) {
        const slug = item.title.replace(/\s+/g, '-').toLowerCase();
        const galleryItem = {
          id: `${selectedSeries}-${slug}-${Date.now()}`,
          slug,
          title: item.title,
          titleEn: item.titleEn || item.title,
          series: selectedSeries,
          image: uploadData.url,
          description: item.description || '',
          featured: item.featured,
        };
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(galleryItem),
        });
      }

      results.push({ name: item.file.name, url: uploadData.url, title: item.title });
    }

    setUploadResults(results);
    setUploading(false);
    setUploadStep('done');
    setPreviewFiles([]);
  };

  // 파일 삭제
  const handleDelete = async (url) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch('/api/admin/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    loadBlobs();
  };

  // 대표이미지 토글
  const handleToggleFeatured = async (blobUrl) => {
    // 기존 갤러리 데이터에서 해당 이미지 찾기
    const existing = galleryItems.find(item => item.image === blobUrl);
    
    if (existing) {
      // 토글: featured 상태 변경
      const updated = { ...existing, featured: !existing.featured };
      await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } else {
      // 갤러리 데이터에 없으면 새로 추가 (featured: true)
      const filename = blobUrl.split('/').pop().replace(/\.[^/.]+$/, '');
      const newItem = {
        id: `${selectedSeries}-${filename}-${Date.now()}`,
        slug: filename,
        title: filename.replace(/[-_]/g, ' '),
        titleEn: filename,
        series: selectedSeries,
        image: blobUrl,
        description: '',
        featured: true,
      };
      await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    }
    loadGalleryItems();
  };

  // blob URL이 갤러리에서 featured인지 확인
  const isFeatured = (blobUrl) => {
    const item = galleryItems.find(g => g.image === blobUrl);
    return item?.featured || false;
  };

  // blob URL이 갤러리에 등록되어 있는지 확인
  const isInGallery = (blobUrl) => {
    return galleryItems.some(g => g.image === blobUrl);
  };

  // 드래그 앤 드롭
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFilesSelected(e.dataTransfer.files);
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner} /></div>;

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>🔒 관리자 모드</h1>
          <p style={styles.loginSubtitle}>Artivoya 관리자 페이지입니다</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력" style={styles.input} autoFocus />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.loginBtn}>로그인</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>⚙️ Artivoya 관리자</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>로그아웃</button>
      </header>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('upload')}
          style={{ ...styles.tab, ...(activeTab === 'upload' ? styles.tabActive : {}) }}>
          📤 이미지 업로드
        </button>
        <button onClick={() => setActiveTab('manage')}
          style={{ ...styles.tab, ...(activeTab === 'manage' ? styles.tabActive : {}) }}>
          🖼️ 이미지 관리
        </button>
      </div>

      <div style={styles.content}>
        {/* 시리즈 & 타입 선택 */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>시리즈</label>
            <select value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)} style={styles.select}>
              {SERIES_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>타입</label>
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} style={styles.select}>
              <option value="gallery">갤러리 이미지</option>
              <option value="thumbnail">시리즈 썸네일</option>
            </select>
          </div>
        </div>

        {/* ===== 업로드 탭 ===== */}
        {activeTab === 'upload' && (
          <div>
            {/* STEP 1: 파일 선택 */}
            {uploadStep === 'select' && (
              <div
                style={{ ...styles.dropZone, ...(dragActive ? styles.dropZoneActive : {}) }}
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
              >
                <div style={styles.dropIcon}>📁</div>
                <p style={styles.dropText}>이미지를 드래그하거나 클릭해서 선택</p>
                <p style={styles.dropSubText}>
                  {uploadType === 'thumbnail'
                    ? `${SERIES_LIST.find(s => s.id === selectedSeries)?.name} 썸네일 교체`
                    : `${SERIES_LIST.find(s => s.id === selectedSeries)?.name} 갤러리에 추가`}
                </p>
                <input type="file" multiple={uploadType === 'gallery'} accept="image/*"
                  onChange={(e) => handleFilesSelected(e.target.files)} style={styles.fileInput} />
              </div>
            )}

            {/* STEP 2: 정보 입력 + 미리보기 */}
            {uploadStep === 'info' && (
              <div>
                <div style={styles.stepHeader}>
                  <h3 style={styles.stepTitle}>📝 이미지 정보 입력</h3>
                  <p style={styles.stepDesc}>업로드할 이미지의 제목과 설명을 입력하세요</p>
                </div>

                {previewFiles.map((item, index) => (
                  <div key={index} style={styles.previewCard}>
                    <div style={styles.previewImageWrap}>
                      <img src={item.preview} alt="미리보기" style={styles.previewImage} />
                      <button onClick={() => removePreviewItem(index)} style={styles.previewRemove}>✕</button>
                    </div>
                    <div style={styles.previewForm}>
                      <input
                        placeholder="제목 (한글) *"
                        value={item.title}
                        onChange={(e) => updatePreviewItem(index, 'title', e.target.value)}
                        style={styles.formInput}
                      />
                      <input
                        placeholder="제목 (영문, 선택)"
                        value={item.titleEn}
                        onChange={(e) => updatePreviewItem(index, 'titleEn', e.target.value)}
                        style={styles.formInput}
                      />
                      <textarea
                        placeholder="설명 (선택)"
                        value={item.description}
                        onChange={(e) => updatePreviewItem(index, 'description', e.target.value)}
                        style={styles.formTextarea}
                      />
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" checked={item.featured}
                          onChange={(e) => updatePreviewItem(index, 'featured', e.target.checked)} />
                        ⭐ 홈 갤러리에 표시 (대표 작품)
                      </label>
                    </div>
                  </div>
                ))}

                <div style={styles.actionBar}>
                  <button onClick={() => { setUploadStep('select'); setPreviewFiles([]); }} style={styles.cancelBtn}>
                    ← 다시 선택
                  </button>
                  <button
                    onClick={handleUploadAll}
                    disabled={uploading || previewFiles.some(f => !f.title)}
                    style={{ ...styles.uploadBtn, opacity: uploading ? 0.6 : 1 }}
                  >
                    {uploading ? '⏳ 업로드 중...' : `🚀 ${previewFiles.length}개 업로드`}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 완료 */}
            {uploadStep === 'done' && (
              <div style={styles.doneContainer}>
                <div style={styles.doneIcon}>✅</div>
                <h3 style={styles.doneTitle}>{uploadResults.length}개 업로드 완료!</h3>
                <div style={styles.doneList}>
                  {uploadResults.map((r, i) => (
                    <div key={i} style={styles.doneItem}>
                      <span style={styles.doneName}>{r.title || r.name}</span>
                      <span style={styles.doneCheck}>✓</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setUploadStep('select'); setUploadResults([]); }} style={styles.uploadBtn}>
                  + 더 업로드하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== 관리 탭 ===== */}
        {activeTab === 'manage' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                {SERIES_LIST.find(s => s.id === selectedSeries)?.name} — {uploadType === 'thumbnail' ? '썸네일' : '갤러리'}
                <span style={styles.count}>{blobs.length}개</span>
                {galleryItems.filter(g => g.featured).length > 0 && (
                  <span style={styles.featuredCount}>⭐ 대표 {galleryItems.filter(g => g.featured).length}개</span>
                )}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => loadBlobs(false)} style={styles.cancelBtn}>🔄 새로고침</button>
                <button onClick={() => loadBlobs(true)} style={styles.cancelBtn}>📦 전체 보기</button>
              </div>
            </div>
            {debugInfo && (
              <div style={{ padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                prefix: &quot;{debugInfo.prefix}&quot; | 결과: {debugInfo.count}개
                {debugInfo.error && <span style={{ color: '#ff6b6b' }}> | 에러: {debugInfo.error}</span>}
                {debugInfo.debug && <span> | {debugInfo.debug}</span>}
              </div>
            )}
            <div style={styles.imageGrid}>
              {blobs.map((blob) => (
                <div key={blob.url} style={{
                  ...styles.imageCard,
                  ...(isFeatured(blob.url) ? styles.imageCardFeatured : {}),
                }}>
                  {isFeatured(blob.url) && <div style={styles.featuredBadge}>⭐ 대표</div>}
                  <div style={styles.imageWrapper}>
                    <img src={blob.url} alt={blob.pathname} style={styles.image} />
                  </div>
                  <div style={styles.imageInfo}>
                    <p style={styles.imageName}>
                      {galleryItems.find(g => g.image === blob.url)?.title || blob.pathname.split('/').pop()}
                    </p>
                    <p style={styles.imageSize}>{(blob.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div style={styles.imageActions}>
                    <button
                      onClick={() => handleToggleFeatured(blob.url)}
                      style={isFeatured(blob.url) ? styles.featuredBtnActive : styles.featuredBtn}
                    >
                      {isFeatured(blob.url) ? '⭐ 대표 해제' : '☆ 대표 설정'}
                    </button>
                    <button onClick={() => handleDelete(blob.url)} style={styles.deleteBtn}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {blobs.length === 0 && <p style={styles.empty}>업로드된 이미지가 없습니다.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a' },
  spinner: { width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loginContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', padding: '1rem' },
  loginCard: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '3rem', width: '100%', maxWidth: 400, textAlign: 'center' },
  loginTitle: { color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem' },
  loginSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2rem' },
  input: { width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' },
  error: { color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' },
  loginBtn: { width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #FF6B35, #E84393)', border: 'none', borderRadius: 8, color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  dashboard: { minHeight: '100vh', background: '#0f0f1a', color: 'white', paddingTop: 80 },
  header: { position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', zIndex: 100 },
  headerTitle: { fontSize: '1.2rem', fontWeight: 700 },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem' },
  tabs: { display: 'flex', gap: '0.5rem', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  tab: { padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(255,107,53,0.15)', borderColor: '#FF6B35', color: '#FF6B35' },
  content: { maxWidth: 900, margin: '0 auto', padding: '1.5rem 2rem' },
  filterBar: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  filterLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: { padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', fontSize: '0.9rem', outline: 'none', minWidth: 180 },
  dropZone: { position: 'relative', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(255,255,255,0.02)' },
  dropZoneActive: { borderColor: '#FF6B35', background: 'rgba(255,107,53,0.08)' },
  dropIcon: { fontSize: '3rem', marginBottom: '0.5rem' },
  dropText: { color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '0.3rem' },
  dropSubText: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' },
  fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },

  // Step 2: 정보 입력
  stepHeader: { marginBottom: '1.5rem' },
  stepTitle: { fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.3rem' },
  stepDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' },
  previewCard: { display: 'flex', gap: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.08)' },
  previewImageWrap: { position: 'relative', width: 160, minWidth: 160, aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#1a1a2e' },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
  previewRemove: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewForm: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  formInput: { padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', fontSize: '0.9rem', outline: 'none' },
  formTextarea: { padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', fontSize: '0.9rem', outline: 'none', minHeight: 60, resize: 'vertical', fontFamily: 'inherit' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },

  actionBar: { display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' },
  cancelBtn: { padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem' },
  uploadBtn: { padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #FF6B35, #E84393)', border: 'none', borderRadius: 8, color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },

  // Step 3: 완료
  doneContainer: { textAlign: 'center', padding: '3rem 1rem' },
  doneIcon: { fontSize: '3rem', marginBottom: '0.5rem' },
  doneTitle: { fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem' },
  doneList: { maxWidth: 400, margin: '0 auto 2rem', textAlign: 'left' },
  doneItem: { display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'rgba(0,214,143,0.08)', borderRadius: 6, marginBottom: '0.5rem', border: '1px solid rgba(0,214,143,0.2)' },
  doneName: { color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' },
  doneCheck: { color: '#00d68f', fontWeight: 700 },

  // 관리 탭
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  count: { fontSize: '0.8rem', background: 'rgba(255,107,53,0.2)', color: '#FF6B35', padding: '0.2rem 0.6rem', borderRadius: 12 },
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  imageCard: { position: 'relative', background: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' },
  imageWrapper: { aspectRatio: '1', overflow: 'hidden', background: '#1a1a2e' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imageInfo: { padding: '0.6rem 0.8rem' },
  imageName: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  imageSize: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' },
  imageActions: { display: 'flex', gap: '0.4rem', padding: '0 0.8rem 0.6rem' },
  featuredBtn: { flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' },
  featuredBtnActive: { flex: 1, padding: '0.5rem', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', color: '#ffd700' },
  deleteBtn: { padding: '0.5rem 0.7rem', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', color: '#ff6b6b' },
  imageCardFeatured: { border: '2px solid rgba(255,215,0,0.5)', boxShadow: '0 0 12px rgba(255,215,0,0.15)' },
  featuredBadge: { position: 'absolute', top: 8, left: 8, zIndex: 2, padding: '0.2rem 0.5rem', background: 'rgba(255,215,0,0.9)', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, color: '#1a1a2e' },
  featuredCount: { fontSize: '0.8rem', background: 'rgba(255,215,0,0.2)', color: '#ffd700', padding: '0.2rem 0.6rem', borderRadius: 12 },
  empty: { gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem' },
};
