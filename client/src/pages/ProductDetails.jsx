import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, Share2 } from 'lucide-react';
import { getProduct } from '../services/productService';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader';
import Seo from '../components/common/Seo';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/product/ProductCard';
import Rating from '../components/product/Rating';
import AddToCart from '../components/product/AddToCart';
import NotFound from './NotFound';

export default function ProductDetails() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [variantId, setVariantId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    setVariantId(null);
    getProduct(slug)
      .then((data) => !cancelled && setState({ loading: false, data, error: null }))
      .catch((err) => !cancelled && setState({ loading: false, data: null, error: err.message }));
    window.scrollTo({ top: 0 });
    return () => { cancelled = true; };
  }, [slug]);

  const product = state.data?.product;
  const recent = useRecentlyViewed(product);

  const view = useMemo(() => {
    if (!product) return null;
    const variant = product.variants?.find((v) => v._id === variantId);
    const hasVariantPrice = variant?.price != null;
    const sale = !hasVariantPrice && product.discountPrice != null && product.discountPrice < product.price;
    return {
      price: hasVariantPrice ? variant.price : product.price,
      salePrice: sale ? product.discountPrice : null,
      stock: variant ? variant.stock : product.stock,
    };
  }, [product, variantId]);

  if (state.loading) return <Loader label="Loading product" />;
  if (state.error || !product) return <NotFound />;

  const { parentCategory, related } = state.data;
  const current = view.salePrice ?? view.price;
  const percentOff = view.salePrice ? Math.round(((view.price - view.salePrice) / view.price) * 100) : 0;
  const url = window.location.href;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description,
    ...(product.images?.[0]?.url && { image: product.images.map((i) => i.url) }),
    offers: {
      '@type': 'Offer', url, priceCurrency: 'INR', price: current,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.ratings?.count > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: product.ratings.average, reviewCount: product.ratings.count },
    }),
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    } catch { /* user cancelled sharing */ }
  };

  return (
    <div className="container-page py-8">
      <Seo title={product.name} description={product.description.slice(0, 155)} image={product.images?.[0]?.url} jsonLd={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/70">
        <ol className="flex flex-wrap gap-x-2">
          <li><Link to="/" className="hover:text-saffron-600">Home</Link> /</li>
          <li><Link to="/shop" className="hover:text-saffron-600">Shop</Link> /</li>
          {parentCategory && <li><Link to={`/category/${parentCategory.slug}`} className="hover:text-saffron-600">{parentCategory.name}</Link> /</li>}
          <li><Link to={`/category/${product.category.slug}`} className="hover:text-saffron-600">{product.category.name}</Link> /</li>
          <li aria-current="page" className="text-maroon-800">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <div className="mt-2"><Rating average={product.ratings?.average} count={product.ratings?.count} /></div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-maroon-800">{formatPrice(current)}</span>
            {view.salePrice && (
              <>
                <span className="text-lg text-ink/50 line-through">{formatPrice(view.price)}</span>
                <span className="rounded bg-maroon-700 px-2 py-0.5 text-sm font-semibold text-cream-50">{percentOff}% OFF</span>
              </>
            )}
          </div>

          <p className={`mt-3 font-medium ${view.stock > 0 ? 'text-green-700' : 'text-maroon-700'}`}>
            {view.stock === 0 ? 'Out of stock' : view.stock <= 5 ? `Only ${view.stock} left in stock` : 'In stock'}
          </p>

          {product.variants?.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-2 font-medium">Options</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <label key={v._id} className={`cursor-pointer rounded-md border px-4 py-2 ${variantId === v._id ? 'border-maroon-700 bg-maroon-50 text-maroon-800' : 'border-gold-400'} ${v.stock === 0 ? 'opacity-50' : ''}`}>
                    <input type="radio" name="variant" className="sr-only" checked={variantId === v._id} onChange={() => setVariantId(v._id)} />
                    {v.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <AddToCart product={product} variantId={variantId} stock={view.stock} />

          {product.authenticity?.verified && (
            <div className="mt-6 flex gap-3 rounded-md border border-gold-300 bg-cream-100 p-4">
              <BadgeCheck className="shrink-0 text-gold-500" />
              <div><p className="font-semibold text-maroon-800">Authenticity verified</p>
                {product.authenticity.details && <p className="text-ink/80">{product.authenticity.details}</p>}</div>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-ink/80">
            <dt className="font-medium">SKU</dt><dd>{product.sku}</dd>
            {product.weight != null && (<><dt className="font-medium">Weight</dt><dd>{product.weight} g</dd></>)}
            <dt className="font-medium">Category</dt><dd>{product.category.name}</dd>
          </dl>

          <button onClick={share} className="mt-6 inline-flex items-center gap-2 text-maroon-700 hover:text-saffron-600">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold">Description</h2>
        <p className="mt-3 whitespace-pre-line text-ink/85">{product.description}</p>
      </section>

      {product.specifications?.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <h2 className="text-2xl font-semibold">Specifications</h2>
          <table className="mt-3 w-full border-collapse text-left">
            <tbody>
              {product.specifications.map((s) => (
                <tr key={s.key} className="border-b border-gold-300/60">
                  <th scope="row" className="w-1/3 py-2 pr-4 font-medium">{s.key}</th><td className="py-2">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Related products</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Recently viewed</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {recent.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
