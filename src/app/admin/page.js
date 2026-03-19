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
  const [uploadResult, setUploadResult] = useState(null);
  const [blobs, setBlobs] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // 갤러리 항목 추가 폼
  const [newItem, setNewItem] = useState({
    title: '',
    titleEn: '',
    description: '',
    featured: false,
  });

  // 인증 상태 확인
  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  // 이미지 목록 로드
  const loadBlobs = useCallback(async () => {
    const prefix = uploadType === 'thumbnail' ? 'series/' : `gallery/${selectedSeries}/`;
    const res = await fetch(`/api/admin/upload?prefix=${prefix}`);
    const data = await res.json();
    setBlobs(data.blobs || []);
  }, [selectedSeries, uploadType]);

  useEffect(() => {
    if (isAuthenticated) loadBlobs();
  }, [isAuthenticated, selectedSeries, uploadType, loadBlobs]);

  // 파일 업로드
  const handleUpload = async (files) => {
    setUploading(true);
    setUploadResult(null);
    const results = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('series', selectedSeries);
      formData.append('type', uploadType);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      results.push(data);
    }

    setUploadResult(`${results.length}개 파일 업로드 완료!`);
    setUploading(false);
    loadBlobs();
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

  // 갤러리 항목 추가
  const handleAddGalleryItem = async (blobUrl) => {
    if (!newItem.title) {
      alert('제목을 입력해주세요.');
      return;
    }

    const slug = newItem.title.replace(/\s+/g, '-').toLowerCase();
    const item = {
      id: `${selectedSeries}-${slug}-${Date.now()}`,
      slug,
      title: newItem.title,
      titleEn: newItem.titleEn || newItem.title,
      series: selectedSeries,
      image: blobUrl,
      description: newItem.description || '',
      featured: newItem.featured,
    };

    await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    setNewItem({ title: '', titleEn: '', description: '', featured: false });
    alert('갤러리 항목이 추가되었습니다!');
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>🔒 관리자 모드</h1>
          <p style={styles.loginSubtitle}>Artivoya 관리자 페이지입니다</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              style={styles.input}
              autoFocus
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.loginBtn}>로그인</button>
          </form>
        </div>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>⚙️ Artivoya 관리자</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>로그아웃</button>
      </header>

      {/* 탭 */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('upload')}
          style={{ ...styles.tab, ...(activeTab === 'upload' ? styles.tabActive : {}) }}
        >
          📤 이미지 업로드
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          style={{ ...styles.tab, ...(activeTab === 'manage' ? styles.tabActive : {}) }}
        >
          🖼️ 이미지 관리
        </button>
      </div>

      <div style={styles.content}>
        {/* 시리즈 선택 & 타입 */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>시리즈</label>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              style={styles.select}
            >
              {SERIES_LIST.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>타입</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              style={styles.select}
            >
              <option value="gallery">갤러리 이미지</option>
              <option value="thumbnail">시리즈 썸네일</option>
            </select>
          </div>
        </div>

        {activeTab === 'upload' && (
          <div>
            {/* 드래그 앤 드롭 영역 */}
            <div
              style={{ ...styles.dropZone, ...(dragActive ? styles.dropZoneActive : {}) }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div style={styles.dropIcon}>📁</div>
              <p style={styles.dropText}>이미지를 드래그하거나 클릭해서 업로드</p>
              <p style={styles.dropSubText}>
                {uploadType === 'thumbnail'
                  ? `${SERIES_LIST.find(s => s.id === selectedSeries)?.name} 썸네일 교체`
                  : `${SERIES_LIST.find(s => s.id === selectedSeries)?.name} 갤러리에 추가`
                }
              </p>
              <input
                type="file"
                multiple={uploadType === 'gallery'}
                accept="image/*"
                onChange={(e) => handleUpload(Array.from(e.target.files))}
                style={styles.fileInput}
              />
            </div>

            {uploading && <p style={styles.uploadStatus}>⏳ 업로드 중...</p>}
            {uploadResult && <p style={styles.uploadSuccess}>✅ {uploadResult}</p>}
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <h3 style={styles.sectionTitle}>
              {SERIES_LIST.find(s => s.id === selectedSeries)?.name} — {uploadType === 'thumbnail' ? '썸네일' : '갤러리'}
              <span style={styles.count}>{blobs.length}개</span>
            </h3>
            <div style={styles.imageGrid}>
              {blobs.map((blob) => (
                <div key={blob.url} style={styles.imageCard}>
                  <div style={styles.imageWrapper}>
                    <img src={blob.url} alt={blob.pathname} style={styles.image} />
                  </div>
                  <div style={styles.imageInfo}>
                    <p style={styles.imageName}>{blob.pathname.split('/').pop()}</p>
                    <p style={styles.imageSize}>{(blob.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div style={styles.imageActions}>
                    <button
                      onClick={() => handleAddGalleryItem(blob.url)}
                      style={styles.addBtn}
                      title="갤러리에 추가"
                    >
                      ➕
                    </button>
                    <button
                      onClick={() => handleDelete(blob.url)}
                      style={styles.deleteBtn}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {blobs.length === 0 && (
                <p style={styles.empty}>업로드된 이미지가 없습니다.</p>
              )}
            </div>

            {/* 갤러리 항목 추가 폼 */}
            {uploadType === 'gallery' && blobs.length > 0 && (
              <div style={styles.addForm}>
                <h3 style={styles.sectionTitle}>갤러리 항목 정보</h3>
                <div style={styles.formGrid}>
                  <input
                    placeholder="제목 (한글)"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    placeholder="제목 (영문)"
                    value={newItem.titleEn}
                    onChange={(e) => setNewItem({ ...newItem, titleEn: e.target.value })}
                    style={styles.formInput}
                  />
                  <textarea
                    placeholder="설명"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    style={styles.formTextarea}
                  />
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newItem.featured}
                      onChange={(e) => setNewItem({ ...newItem, featured: e.target.checked })}
                    />
                    홈 갤러리에 표시
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f1a',
  },
  spinner: {
    width: 40, height: 40,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '1rem',
  },
  loginCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '3rem',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  loginTitle: {
    color: 'white',
    fontSize: '1.8rem',
    marginBottom: '0.5rem',
  },
  loginSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    marginBottom: '2rem',
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  loginBtn: {
    width: '100%',
    padding: '0.9rem',
    background: 'linear-gradient(135deg, #FF6B35, #E84393)',
    border: 'none',
    borderRadius: 8,
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  dashboard: {
    minHeight: '100vh',
    background: '#0f0f1a',
    color: 'white',
    paddingTop: 80,
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'rgba(15,15,26,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    zIndex: 100,
  },
  headerTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  tab: {
    padding: '0.6rem 1.2rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(255,107,53,0.15)',
    borderColor: '#FF6B35',
    color: '#FF6B35',
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '1.5rem 2rem',
  },
  filterBar: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '0.6rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    minWidth: 180,
  },
  dropZone: {
    position: 'relative',
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: '3rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'rgba(255,255,255,0.02)',
  },
  dropZoneActive: {
    borderColor: '#FF6B35',
    background: 'rgba(255,107,53,0.08)',
  },
  dropIcon: { fontSize: '3rem', marginBottom: '0.5rem' },
  dropText: { color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '0.3rem' },
  dropSubText: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' },
  fileInput: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  uploadStatus: { textAlign: 'center', color: '#ffd700', marginTop: '1rem' },
  uploadSuccess: { textAlign: 'center', color: '#00d68f', marginTop: '1rem' },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  count: {
    fontSize: '0.8rem',
    background: 'rgba(255,107,53,0.2)',
    color: '#FF6B35',
    padding: '0.2rem 0.6rem',
    borderRadius: 12,
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  imageCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.2s',
  },
  imageWrapper: {
    aspectRatio: '1',
    overflow: 'hidden',
    background: '#1a1a2e',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageInfo: {
    padding: '0.6rem 0.8rem',
  },
  imageName: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  imageSize: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '0.2rem',
  },
  imageActions: {
    display: 'flex',
    gap: '0.3rem',
    padding: '0 0.8rem 0.6rem',
  },
  addBtn: {
    flex: 1,
    padding: '0.4rem',
    background: 'rgba(0,214,143,0.15)',
    border: '1px solid rgba(0,214,143,0.3)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  deleteBtn: {
    padding: '0.4rem 0.6rem',
    background: 'rgba(255,107,107,0.15)',
    border: '1px solid rgba(255,107,107,0.3)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    padding: '3rem',
  },
  addForm: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  formInput: {
    padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
  },
  formTextarea: {
    padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    minHeight: 80,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
  },
};
