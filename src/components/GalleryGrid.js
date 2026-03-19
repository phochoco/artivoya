import Link from 'next/link';
import Image from 'next/image';
import { getSeriesById } from '@/data/series';
import FluentEmoji from '@/components/FluentEmoji';

export default function GalleryGrid({ items }) {
  return (
    <div className="gallery-grid">
      {items.map((item) => {
        const itemSeries = getSeriesById(item.series);
        return (
          <Link key={item.id} href={`/gallery/${item.slug}`} className="gallery-item">
            {(item.image || itemSeries?.image) ? (
              <Image
                src={item.image || itemSeries.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 280px"
                className="gallery-item-image"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div
                className="gallery-item-image"
                style={{
                  background: itemSeries
                    ? itemSeries.gradient
                    : 'linear-gradient(135deg, #ccc, #eee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  width: '100%',
                  height: '100%',
                }}
              >
                <FluentEmoji name={itemSeries?.icon} size={48} />
              </div>
            )}
            <div className="gallery-item-overlay">
              <div>
                <h4>{item.title}</h4>
                <p>{itemSeries?.name}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
