import { formatPrice } from '../../utils/formatPrice';

// Price breakdown. `quote` comes from the server (POST /orders/quote).
export default function OrderSummary({ quote, children }) {
  return (
    <aside className="h-fit rounded-lg border border-gold-300 bg-white p-6" aria-label="Order summary">
      <h2 className="text-2xl font-semibold">Order summary</h2>
      {!quote ? <p className="mt-4 text-ink/70">Calculating...</p> : (
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(quote.subtotal)}</dd></div>
          {quote.discount > 0 && (
            <div className="flex justify-between text-green-700"><dt>Coupon ({quote.coupon?.code})</dt><dd>-{formatPrice(quote.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{quote.shippingCharge === 0 ? 'Free' : formatPrice(quote.shippingCharge)}</dd></div>
          <div className="flex justify-between border-t border-gold-300 pt-3 text-xl font-semibold text-maroon-800"><dt>Total</dt><dd>{formatPrice(quote.total)}</dd></div>
        </dl>
      )}
      {children}
    </aside>
  );
}
