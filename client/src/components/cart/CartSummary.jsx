import Button from '../common/Button';
import { formatPrice } from '../../utils/formatPrice';

export default function CartSummary({ cart }) {
  return (
    <aside className="h-fit rounded-lg border border-gold-300 bg-white p-6" aria-label="Order summary">
      <h2 className="text-2xl font-semibold">Summary</h2>
      <dl className="mt-4 space-y-2">
        <div className="flex justify-between"><dt>Items</dt><dd>{cart.itemCount}</dd></div>
        <div className="flex justify-between text-lg font-semibold text-maroon-800"><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-ink/70">Shipping and coupon discounts are applied at checkout.</p>
      <Button to="/checkout" variant="saffron" className="mt-5 w-full">Proceed to checkout</Button>
      <Button to="/shop" variant="outline" className="mt-3 w-full">Continue shopping</Button>
    </aside>
  );
}
