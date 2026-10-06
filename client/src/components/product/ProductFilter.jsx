import { useEffect, useState } from 'react';

const RATINGS = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4 stars & up' },
  { value: '3', label: '3 stars & up' },
];

export default function ProductFilter({ filters, categories, selectedCategory, onCategory, onChange, onReset }) {
  const [min, setMin] = useState(filters.minPrice);
  const [max, setMax] = useState(filters.maxPrice);

  // Keep the inputs in sync when the URL changes (e.g. after Reset)
  useEffect(() => { setMin(filters.minPrice); setMax(filters.maxPrice); }, [filters.minPrice, filters.maxPrice]);

  const topLevel = categories.filter((c) => !c.parent);
  const childrenOf = (id) => categories.filter((c) => c.parent === id);

  const applyPrice = (e) => {
    e.preventDefault();
    onChange({ minPrice: min, maxPrice: max });
  };

  const radio = (value, label, indent = false) => (
    <li key={value || 'all'} className={indent ? 'ml-5' : ''}>
      <label className="flex cursor-pointer items-center gap-2 py-1">
        <input type="radio" name="category" checked={selectedCategory === value} onChange={() => onCategory(value)} className="accent-maroon-700" />
        <span className={selectedCategory === value ? 'font-semibold text-maroon-800' : ''}>{label}</span>
      </label>
    </li>
  );

  return (
    <div className="space-y-7 rounded-lg border border-gold-300/70 bg-white p-5">
      <fieldset>
        <legend className="mb-2 font-display text-xl font-semibold text-maroon-800">Category</legend>
        <ul>
          {radio('', 'All products')}
          {topLevel.map((c) => (
            <li key={c._id}>
              <ul>
                {radio(c.slug, c.name)}
                {childrenOf(c._id).map((ch) => radio(ch.slug, ch.name, true))}
              </ul>
            </li>
          ))}
        </ul>
      </fieldset>

      <form onSubmit={applyPrice}>
        <h3 className="mb-2 font-display text-xl font-semibold">Price (Rs.)</h3>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="minPrice">Minimum price</label>
          <input id="minPrice" type="number" min="0" inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-md border border-gold-400 px-2 py-1.5" />
          <span>-</span>
          <label className="sr-only" htmlFor="maxPrice">Maximum price</label>
          <input id="maxPrice" type="number" min="0" inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)}
            className="w-full rounded-md border border-gold-400 px-2 py-1.5" />
        </div>
        <button className="mt-2 w-full rounded-md border border-maroon-700 py-1.5 text-maroon-700 hover:bg-maroon-700 hover:text-cream-50">Apply</button>
      </form>

      <fieldset>
        <legend className="mb-2 font-display text-xl font-semibold">Rating</legend>
        {RATINGS.map((r) => (
          <label key={r.value} className="flex cursor-pointer items-center gap-2 py-1">
            <input type="radio" name="rating" checked={filters.rating === r.value} onChange={() => onChange({ rating: r.value })} className="accent-maroon-700" />
            {r.label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-xl font-semibold">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <input type="checkbox" checked={filters.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} className="accent-maroon-700" />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <input type="checkbox" checked={filters.onSale} onChange={(e) => onChange({ onSale: e.target.checked })} className="accent-maroon-700" />
          On sale
        </label>
      </fieldset>

      <button onClick={onReset} className="text-sm font-medium text-saffron-600 underline">Reset filters</button>
    </div>
  );
}
