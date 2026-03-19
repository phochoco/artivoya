import Link from 'next/link';
import Image from 'next/image';
import FluentEmoji from '@/components/FluentEmoji';

export default function SeriesCard({ series }) {
  return (
    <Link href={`/${series.slug}`} className="series-card" style={{ '--card-gradient': series.gradient }}>
      <div className="series-card-bg" />
      {series.image && (
        <Image
          src={series.image}
          alt={series.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
          className="series-card-image"
        />
      )}
      <div className="series-card-overlay" />
      <div className="series-card-content">
        <div className="series-card-icon"><FluentEmoji emoji={series.icon} size={40} /></div>
        <h3>{series.name}</h3>
        <p>{series.tagline}</p>
      </div>
      <div className="series-card-arrow">→</div>
    </Link>
  );
}
