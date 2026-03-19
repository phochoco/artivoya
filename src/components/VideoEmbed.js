export default function VideoEmbed({ videoId, title, isShorts = false }) {
  const embedUrl = isShorts
    ? `https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}`
    : `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className={`video-embed${isShorts ? ' video-embed-shorts' : ''}`}>
      <iframe
        src={embedUrl}
        title={title || 'Artivoya Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
