import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductFilter from './ProductFilter';
import ProductGrid from './ProductGrid';
import Pagination from '../common/Pagination';
import Seo from '../common/Seo';
import { useCategories, useProducts } from '../../hooks/useProducts';

const SORT_OPTIONS = [
  ['newest', 'Newest'],
  ['popularity', 'Popularity'],
  ['rating', 'Rating'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
];

// Shared by Shop, Category and Search pages. All filters live in the URL, so links can be shared.
export default function ProductListing({ title, fixedCategory, heading }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get('q') || '';
  const category = fixedCategory ?? (params.get('category') || '');
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;
  const filters = {
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    rating: params.get('rating') || '',
    inStock: params.get('inStock') === 'true',
    onSale: params.get('onSale') === 'true',
  };

  const { products, pagination, loading, error } = useProducts({
    search: q, category, ...filters, sort, page, limit: 12,
  });

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v === false || v == null ? next.delete(k) : next.set(k, String(v))));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const changeCategory = (slug) => {
    if (fixedCategory === undefined) return update({ category: slug });
    const next = new URLSearchParams(params);
    next.delete('page');
    navigate({ pathname: slug ? `/category/${slug}` : '/shop', search: next.toString() });
    return undefined;
  };

  const reset = () => update({ minPrice: '', maxPrice: '', rating: '', inStock: false, onSale: false, sort: '' });

  const categoryName = categories.find((c) => c.slug === category)?.name;
  const pageTitle = heading || categoryName || title;

  return (
    <div className="container-page py-10">
      <Seo title={pageTitle} description={`Browse ${pageTitle} at Shree Krishna Rudraksh Point.`} />
      <h1 className="text-4xl font-bold">{pageTitle}</h1>
      {q && <p className="mt-1 text-ink/70">Showing results for &ldquo;{q}&rdquo;</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button className="flex items-center gap-2 rounded-md border border-maroon-700 px-4 py-2 text-maroon-700 lg:hidden"
          aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={18} /> Filters
        </button>
        <p className="text-ink/70" aria-live="polite">{!loading && pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : '\u00a0'}</p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-ink/70">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}
            className="rounded-md border border-gold-400 bg-white px-3 py-2">
            {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`} aria-label="Filters">
          <ProductFilter filters={filters} categories={categories} selectedCategory={category}
            onCategory={changeCategory} onChange={update} onReset={reset} />
        </aside>
        <div>
          <ProductGrid products={products} loading={loading} error={error} skeletonCount={6}
            emptyMessage="No products match your filters. Try resetting them or searching for something else." />
          <Pagination page={pagination?.page || 1} pages={pagination?.pages || 1}
            onChange={(p) => { update({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      </div>
    </div>
  );
}
