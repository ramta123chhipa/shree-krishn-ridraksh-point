import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBanners } from '../../services/bannerService';

// Banners the owner manages from the admin dashboard. Hidden entirely when there are none.
export default function Banners() {
  const [banners, setBanners] = useState([]);
  useEffect(() => { getBanners().then(setBanners).catch(() => {}); }, []);
  if (!banners.length) return null;

  return (
    <section className="container-page pt-10" aria-label="Offers and highlights">
      <ul className={`grid gap-5 ${banners.length === 1 ? '' : banners.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {banners.map((b) => {
          const inner = (
            <>
              <img src={b.image.url} alt="" loading="lazy" className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-56" />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-maroon-900/85 via-maroon-900/20 to-transparent p-5 text-cream-50">
                <h2 className="font-display text-2xl font-semibold text-cream-50">{b.title}</h2>
                {b.subtitle && <p className="text-cream-100">{b.subtitle}</p>}
              </div>
            </>
          );
          const cls = 'group relative block overflow-hidden rounded-lg border border-gold-300';
          return <li key={b._id}>{b.link ? <Link to={b.link} className={cls} aria-label={b.title}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>;
        })}
      </ul>
    </section>
  );
}
