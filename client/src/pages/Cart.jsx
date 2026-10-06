import { useState } from 'react';
import toast from 'react-hot-toast';
import Seo from '../components/common/Seo';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [busy, setBusy] = useState(false);

  const run = async (fn, okMessage) => {
    setBusy(true);
    try { await fn(); if (okMessage) toast.success(okMessage); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  if (loading) return <Loader label="Loading your cart" />;

  return (
    <div className="container-page py-10">
      <Seo title="Your cart" />
      <h1 className="text-4xl font-bold">Your cart</h1>

      {cart.items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-ink/70">Your cart is empty.</p>
          <Button to="/shop" className="mt-6">Start shopping</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <ul>
            {cart.items.map((item) => (
              <CartItem key={`${item.productId}-${item.variantId || ''}`} item={item} busy={busy}
                onQuantity={(q) => run(() => updateItem(item.productId, item.variantId, q))}
                onRemove={() => run(() => removeItem(item.productId, item.variantId), 'Item removed')} />
            ))}
          </ul>
          <CartSummary cart={cart} />
        </div>
      )}
    </div>
  );
}
