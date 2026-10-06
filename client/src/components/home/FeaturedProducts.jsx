import { Link } from 'react-router-dom';
import ProductGrid from '../product/ProductGrid';
import { useProducts } from '../../hooks/useProducts';

// Reusable home-page product row. `params` are sent to GET /api/products.
export default function FeaturedProducts({ title, params, viewAllTo = '/shop' }) {
  const { products, loading, error } = useProducts({ limit: 4, ...params });
  // Hide the section entirely when there is nothing to show
  if (!loading && !error && !products.length) return null;
  return (
    <section className="container-page py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        <Link to={viewAllTo} className="font-medium text-saffron-600 hover:underline">View all</Link>
      </div>
      <ProductGrid products={products} loading={loading} error={error} skeletonCount={4} />
    </section>
  );
}
