import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import ProductImage from '../product/ProductImage';
import { formatPrice } from '../../utils/formatPrice';

const MAX_QTY = 10;

export default function CartItem({ item, busy, onQuantity, onRemove }) {
  const max = Math.max(Math.min(item.stock, MAX_QTY), 1);
  return (
    <li className="flex gap-4 border-b border-gold-300/60 py-5">
      <Link to={`/product/${item.slug}`} className="w-24 shrink-0 sm:w-28">
        <ProductImage product={{ name: item.name, images: item.image ? [{ url: item.image }] : [] }} className="aspect-square rounded-md" />
      </Link>
      <div className="flex-1">
        <Link to={`/product/${item.slug}`} className="font-semibold text-maroon-800 hover:text-saffron-600">{item.name}</Link>
        {item.variantLabel && <p className="text-sm text-ink/70">Option: {item.variantLabel}</p>}
        <p className="mt-1 text-ink/80">{formatPrice(item.unitPrice)}
          {item.listPrice > item.unitPrice && <span className="ml-2 text-sm text-ink/50 line-through">{formatPrice(item.listPrice)}</span>}
        </p>

        {!item.available && <p role="alert" className="mt-1 text-sm font-medium text-maroon-700">Out of stock. This item is not included in your total.</p>}
        {item.adjusted && <p role="status" className="mt-1 text-sm text-saffron-600">Quantity reduced to {item.quantity} because of limited stock.</p>}

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {item.available && (
            <div className="flex items-center rounded-md border border-gold-400" role="group" aria-label={`Quantity for ${item.name}`}>
              <button className="px-3 py-1.5 disabled:opacity-40" disabled={busy || item.quantity <= 1} onClick={() => onQuantity(item.quantity - 1)} aria-label="Decrease quantity">-</button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button className="px-3 py-1.5 disabled:opacity-40" disabled={busy || item.quantity >= max} onClick={() => onQuantity(item.quantity + 1)} aria-label="Increase quantity">+</button>
            </div>
          )}
          <button onClick={onRemove} disabled={busy} className="inline-flex items-center gap-1 text-sm text-maroon-700 underline disabled:opacity-50">
            <Trash2 size={16} aria-hidden="true" /> Remove
          </button>
        </div>
      </div>
      {item.available && <p className="font-semibold text-maroon-800">{formatPrice(item.unitPrice * item.quantity)}</p>}
    </li>
  );
}
