import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import Rating from './Rating';
import WishlistButton from './WishlistButton';
import { formatPrice } from '../../utils/formatPrice';

export default function ProductCard({ product }) {
  const { _id, slug, name, price, discountPrice, stock, ratings, category } = product;
  const onSale = discountPrice != null && discountPrice < price;
  const percentOff = onSale ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-gold-300/70 bg-white transition-shadow hover:shadow-lg">
      <div className="relative">
      <Link to={`/product/${slug}`} className="relative block" aria-label={name}>
        <ProductImage product={product} className="aspect-square transition-transform duration-300 group-hover:scale-105" />
        {onSale && <span className="absolute left-3 top-3 rounded bg-maroon-700 px-2 py-0.5 text-xs font-semibold text-cream-50">{percentOff}% OFF</span>}
        {stock === 0 && <span className="absolute right-3 top-3 rounded bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white">Out of stock</span>}
      </Link>
      <WishlistButton productId={_id} className="absolute bottom-3 right-3" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {category?.name && <p className="text-xs uppercase tracking-wide text-saffron-600">{category.name}</p>}
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug">
          <Link to={`/product/${slug}`} className="hover:text-saffron-600">{name}</Link>
        </h3>
        <div className="mt-1"><Rating average={ratings?.average} count={ratings?.count} /></div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-semibold text-maroon-800">{formatPrice(onSale ? discountPrice : price)}</span>
          {onSale && <span className="text-sm text-ink/50 line-through">{formatPrice(price)}</span>}
        </div>
        {stock > 0 && stock <= 5 && <p className="mt-1 text-sm text-saffron-600">Only {stock} left</p>}
      </div>
    </article>
  );
}
