'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DynamicGalleryGrid({ series, featuredOnly = false, limit }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (series) params.set('series', series);
    if (featuredOnly) params.set('featured', 'true');
    if (limit) params.set('limit', limit.toString());

    fetch(`/api/gallery?${params}`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [series, featuredOnly, limit]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(0,0,0,0.4)' }}>
        불러오는 중...
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/gallery/${item.slug}`}
          className="gallery-item"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                🎨
              </div>
            )}
          </div>
          <div className="gallery-item-overlay">
            <div>
              <h4>{item.title}</h4>
              {item.titleEn && <p>{item.titleEn}</p>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
