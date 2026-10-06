import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/common/Seo';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import { cancelOrder, getOrder, requestReturn } from '../services/orderService';
import { useSettings } from '../hooks/useSettings';
import { payForOrder, PAYMENT_CANCELLED } from '../services/paymentService';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import NotFound from './NotFound';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const CANCELLABLE = ['Pending', 'Confirmed'];

export default function OrderDetails() {
  const { id } = useParams();
  const { reload } = useCart();
  const settings = useSettings();
  const [returning, setReturning] = useState(false);
  const [reason, setReason] = useState('');
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => getOrder(id).then(setOrder).catch(() => setMissing(true)), [id]);
  useEffect(() => { load(); }, [load]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    try { setOrder(await cancelOrder(id)); toast.success('Order cancelled'); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const payNow = async () => {
    setBusy(true);
    try { setOrder(await payForOrder(id)); await reload().catch(() => {}); toast.success('Payment received'); }
    catch (err) { if (err.message !== PAYMENT_CANCELLED) toast.error(err.message); }
    finally { setBusy(false); }
  };

  const sendReturn = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { setOrder(await requestReturn(id, reason)); setReturning(false); toast.success('Return requested'); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  if (missing) return <NotFound />;
  if (!order) return <Loader label="Loading order" />;

  const canPay = order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' && order.status === 'Pending';
  const a = order.shippingAddress;
  const returnDays = settings?.returnWindowDays ?? 7;
  const canReturn = order.status === 'Delivered' && !order.returnRequest?.status && order.deliveredAt
    && Date.now() - new Date(order.deliveredAt).getTime() <= returnDays * 24 * 60 * 60 * 1000;
  const rr = order.returnRequest;

  return (
    <div className="container-page py-10">
      <Seo title={`Order ${order.orderNumber}`} />
      <Link to="/orders" className="text-saffron-600 hover:underline">&larr; All orders</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Order {order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-ink/70">Placed on {fmt(order.createdAt)}</p>

      {canPay && (
        <div role="status" className="mt-5 flex flex-wrap items-center gap-3 rounded-md border border-gold-400 bg-saffron-50 p-4">
          <span>This order is waiting for payment. Unpaid orders are cancelled automatically after 30 minutes.</span>
          <button onClick={payNow} disabled={busy} className="rounded-md bg-saffron-500 px-5 py-2 font-medium text-white hover:bg-saffron-600 disabled:opacity-60">Pay {formatPrice(order.pricing.total)} now</button>
        </div>
      )}
      {rr?.status === 'requested' && <p role="status" className="mt-5 rounded-md bg-saffron-50 p-4">Your return request is with the store. We will update this page once it is reviewed.</p>}
      {rr?.status === 'approved' && <p role="status" className="mt-5 rounded-md bg-saffron-50 p-4">Your return was approved. The store will refund you once the items are back with us.</p>}
      {rr?.status === 'rejected' && <p role="status" className="mt-5 rounded-md bg-maroon-50 p-4 text-maroon-700">Your return request was declined. Please contact us if you have questions.</p>}
      {order.status === 'Cancelled' && order.refundRequired && (
        <p role="status" className="mt-5 rounded-md bg-saffron-50 p-4">This order was cancelled after payment. The store will refund {formatPrice(order.pricing.total)} to your original payment method.</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-2xl font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-gold-300/60 rounded-lg border border-gold-300 bg-white">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-4 p-4">
                <div><p className="font-medium text-maroon-800">{i.name}</p>
                  <p className="text-sm text-ink/70">{i.variantLabel ? `${i.variantLabel} · ` : ''}{formatPrice(i.unitPrice)} × {i.quantity}</p></div>
                <p className="font-semibold">{formatPrice(i.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold">Status history</h2>
          <ol className="mt-3 space-y-3 border-l-2 border-gold-300 pl-5">
            {[...order.statusHistory].reverse().map((h, idx) => (
              <li key={idx}><p className="font-medium text-maroon-800">{h.status}</p><p className="text-sm text-ink/70">{fmt(h.at)}{h.note ? ` · ${h.note}` : ''}</p></li>
            ))}
          </ol>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-gold-300 bg-white p-5">
            <h2 className="text-xl font-semibold">Payment</h2>
            <dl className="mt-3 space-y-1">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.pricing.subtotal)}</dd></div>
              {order.pricing.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon ({order.coupon?.code})</dt><dd>-{formatPrice(order.pricing.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Shipping</dt><dd>{order.pricing.shippingCharge === 0 ? 'Free' : formatPrice(order.pricing.shippingCharge)}</dd></div>
              <div className="flex justify-between border-t border-gold-300 pt-2 text-lg font-semibold text-maroon-800"><dt>Total</dt><dd>{formatPrice(order.pricing.total)}</dd></div>
            </dl>
            <p className="mt-3 text-sm text-ink/70">{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'} · {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Payment failed' : 'Payment pending'}</p>
          </section>

          <section className="rounded-lg border border-gold-300 bg-white p-5">
            <h2 className="text-xl font-semibold">Delivery address</h2>
            <p className="mt-2 text-ink/80">{a.fullName}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}</p>
          </section>

          {(order.shipment?.courier || order.shipment?.trackingId) && (
            <section className="rounded-lg border border-gold-300 bg-white p-5">
              <h2 className="text-xl font-semibold">Shipment</h2>
              <p className="mt-2 text-ink/80">{order.shipment.courier}{order.shipment.courier && order.shipment.trackingId ? ' · ' : ''}{order.shipment.trackingId && <>Tracking number <strong>{order.shipment.trackingId}</strong></>}</p>
            </section>
          )}

          {canReturn && !returning && (
            <button onClick={() => setReturning(true)} className="w-full rounded-md border border-maroon-700 py-2.5 text-maroon-700 hover:bg-maroon-50">Request a return</button>
          )}
          {canReturn && returning && (
            <form onSubmit={sendReturn} className="rounded-lg border border-gold-300 bg-white p-5">
              <label htmlFor="return-reason" className="block font-medium text-maroon-800">Why do you want to return it?</label>
              <textarea id="return-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} required minLength={5} className="mt-1 w-full rounded-md border border-gold-400 px-3 py-2" />
              <p className="mt-1 text-sm text-ink/60">You can return an order within {returnDays} days of delivery.</p>
              <div className="mt-3 flex gap-3">
                <button disabled={busy} className="rounded-md bg-maroon-700 px-5 py-2 text-cream-50 hover:bg-maroon-800 disabled:opacity-60">Send request</button>
                <button type="button" onClick={() => setReturning(false)} className="rounded-md border border-maroon-700 px-5 py-2 text-maroon-700">Cancel</button>
              </div>
            </form>
          )}

          {CANCELLABLE.includes(order.status) && (
            <button onClick={cancel} disabled={busy} className="w-full rounded-md border border-maroon-700 py-2.5 text-maroon-700 hover:bg-maroon-50 disabled:opacity-60">Cancel order</button>
          )}
        </aside>
      </div>
    </div>
  );
}
