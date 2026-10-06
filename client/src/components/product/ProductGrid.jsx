import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, error, skeletonCount = 8, emptyMessage = 'No products found.' }) {
  if (loading) {
    return (
      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <li key={i} className="animate-pulse overflow-hidden rounded-lg border border-gold-300/50 bg-white">
            <div className="aspect-square bg-cream-200" />
            <div className="space-y-2 p-4"><div className="h-3 w-1/3 rounded bg-cream-200" /><div className="h-5 w-4/5 rounded bg-cream-200" /><div className="h-5 w-1/3 rounded bg-cream-200" /></div>
          </li>
        ))}
      </ul>
    );
  }
  if (error) return <p role="alert" className="rounded-md bg-maroon-50 p-4 text-maroon-700">Could not load products: {error}</p>;
  if (!products.length) return <p className="py-12 text-center text-ink/70">{emptyMessage}</p>;

  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}
    </ul>
  );
}
