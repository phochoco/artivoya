'use client';

import { useState, useEffect } from 'react';
import VideoEmbed from './VideoEmbed';

export default function DynamicVideoGrid({ series, limit }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = series
      ? `/api/admin/videos?series=${series}`
      : '/api/admin/videos';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setVideos(limit ? data.slice(0, limit) : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [series, limit]);

  if (loading || videos.length === 0) return null;

  return (
    <div className="video-grid">
      {videos.map(video => (
        <VideoEmbed
          key={video.id}
          videoId={video.videoId}
          title={video.title}
          isShorts={video.isShorts}
        />
      ))}
    </div>
  );
}
