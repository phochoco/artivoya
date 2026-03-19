export default function VideoEmbed({ videoId, title }) {
  return (
    <div className="video-card">
      <div className="video-embed">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'Artivoya Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
