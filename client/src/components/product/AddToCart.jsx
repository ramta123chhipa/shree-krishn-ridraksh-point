import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useRequireLogin } from '../../hooks/useAuth';
import WishlistButton from './WishlistButton';

const MAX_QTY = 10; // keep in sync with the server (MAX_QTY_PER_ITEM)

export default function AddToCart({ product, variantId, stock }) {
  const { addItem } = useCart();
  const requireLogin = useRequireLogin();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const max = Math.max(Math.min(stock, MAX_QTY), 1);
  const needsVariant = product.variants?.length > 0 && !variantId;

  // Keep the quantity valid when the chosen option changes
  useEffect(() => { setQty((q) => Math.min(q, max)); }, [max]);

  const add = async () => {
    if (needsVariant) { toast.error('Please choose an option first'); return; }
    if (!requireLogin()) return;
    setBusy(true);
    try {
      await addItem(product._id, variantId, qty);
      toast.success(<span>Added to cart. <Link to="/cart" className="font-semibold underline">View cart</Link></span>);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {stock > 0 && (
        <div className="flex items-center rounded-md border border-gold-400" role="group" aria-label="Quantity">
          <button type="button" className="px-4 py-3 disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="Decrease quantity">-</button>
          <span className="w-10 text-center" aria-live="polite">{qty}</span>
          <button type="button" className="px-4 py-3 disabled:opacity-40" disabled={qty >= max} onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
        </div>
      )}
      <button onClick={add} disabled={busy || stock === 0}
        className="inline-flex items-center gap-2 rounded-md bg-saffron-500 px-7 py-3 font-medium text-white hover:bg-saffron-600 disabled:cursor-not-allowed disabled:opacity-60">
        <ShoppingCart size={20} aria-hidden="true" /> {stock === 0 ? 'Out of stock' : busy ? 'Adding...' : 'Add to cart'}
      </button>
      <WishlistButton productId={product._id} label />
    </div>
  );
}
