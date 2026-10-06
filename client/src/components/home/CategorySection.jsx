import { Link } from 'react-router-dom';
import { FEATURED_CATEGORIES } from '../../utils/constants';
import { useCategories } from '../../hooks/useProducts';

export default function CategorySection() {
  const { categories } = useCategories();
  const top = categories.filter((c) => !c.parent);
  const items = top.length
    ? top.map((c) => ({
        name: c.name,
        slug: c.slug,
        note: categories.filter((k) => k.parent === c._id).map((k) => k.name).join(', ') || 'Browse the collection',
      }))
    : FEATURED_CATEGORIES;

  return (
    <section className="container-page py-16">
      <h2 className="section-title">Shop by category</h2>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => (
          <li key={c.slug}>
            <Link to={`/category/${c.slug}`}
              className="group block h-full rounded-lg border border-gold-300 bg-white p-6 transition-shadow hover:shadow-lg">
              <h3 className="text-2xl font-semibold group-hover:text-saffron-600">{c.name}</h3>
              <p className="mt-2 text-ink/70">{c.note}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
