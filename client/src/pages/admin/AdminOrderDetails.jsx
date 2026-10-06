import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader, { primaryBtn } from '../../components/admin/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { getOrder, refundOrder, updateOrderStatus } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const input = 'mt-1 w-full rounded-md border border-gold-400 bg-white px-3 py-2';
const Box = ({ title, children }) => (
  <section className="rounded-lg border border-gold-300 bg-white p-5">
    <h2 className="mb-3 text-xl font-semibold">{title}</h2>{children}
  </section>
);

function StatusPanel({ order, allowedNext, onChanged }) {
  const [next, setNext] = useState('');
  const [note, setNote] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [restock, setRestock] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setNext(''); setNote(''); setRestock(false); }, [order.status]);

  if (allowedNext.length === 0) return <p className="text-ink/70">No further status changes are possible for a {order.status.toLowerCase()} order.</p>;

  const submit = async (e) => {
    e.preventDefault();
    if (next === 'Cancelled' && !window.confirm('Cancel this order? Stock goes back on the shelf.')) return;
    setBusy(true);
    try {
      onChanged(await updateOrderStatus(order._id, { status: next, note, courier, trackingId, restock }));
      toast.success(`Order marked ${next}`);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      <fieldset>
        <legend className="mb-2 font-medium">Move this order to:</legend>
        <div className="flex flex-wrap gap-2">
          {allowedNext.map((s) => (
            <label key={s} className={`cursor-pointer rounded-md border px-4 py-2 ${next === s ? 'border-maroon-700 bg-maroon-50' : 'border-gold-300'}`}>
              <input type="radio" name="next-status" value={s} checked={next === s} onChange={() => setNext(s)} className="mr-2 accent-maroon-700" />
              {order.status === 'Return Requested' ? (s === 'Returned' ? 'Approve return' : 'Decline return') : s}
            </label>
          ))}
        </div>
      </fieldset>
      {next === 'Shipped' && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><label htmlFor="courier" className="text-sm font-medium">Courier</label><input id="courier" value={courier} onChange={(e) => setCourier(e.target.value)} className={input} placeholder="e.g. India Post" /></div>
          <div><label htmlFor="tracking" className="text-sm font-medium">Tracking number</label><input id="tracking" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className={input} /></div>
        </div>
      )}
      {next === 'Returned' && (
        <label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="accent-maroon-700" /> Put the returned items back in stock</label>
      )}
      {next === 'Refunded' && <p className="mt-3 rounded-md bg-saffron-50 p-3 text-sm">Only mark this once you have paid the customer back (cash or bank transfer).</p>}
      {next && (
        <div className="mt-3">
          <label htmlFor="note" className="text-sm font-medium">Note (optional, visible in the history)</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className={input} />
        </div>
      )}
      <button disabled={!next || busy} className={`${primaryBtn} mt-4`}>{busy ? 'Saving...' : 'Update status'}</button>
    </form>
  );
}

function RefundPanel({ order, refund, onChanged }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    const value = amount === '' ? refund.remaining : Number(amount);
    if (!window.confirm(`Send a refund of ${formatPrice(value)} to the customer's original payment method? This cannot be undone.`)) return;
    setBusy(true);
    try { onChanged(await refundOrder(order._id, amount === '' ? undefined : value)); setAmount(''); toast.success('Refund sent to Razorpay'); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      {refund.refunds.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm">
          {refund.refunds.map((r) => <li key={r.refundId}>{formatPrice(r.amount)} refunded · {r.status} · {fmt(r.at)}</li>)}
        </ul>
      )}
      {refund.eligible ? (
        <form onSubmit={send} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="refund-amount" className="block text-sm font-medium">Amount (leave empty for all {formatPrice(refund.remaining)})</label>
            <input id="refund-amount" type="number" min="1" max={refund.remaining} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${input} w-56`} />
          </div>
          <button disabled={busy} className={primaryBtn}>{busy ? 'Sending...' : 'Refund via Razorpay'}</button>
        </form>
      ) : (
        <p className="text-ink/70">
          {order.paymentMethod === 'cod' ? 'Cash on delivery orders are refunded by you directly (cash or bank transfer).'
            : order.paymentStatus === 'refunded' ? 'This order has been fully refunded.'
            : 'A refund can be sent once the order is cancelled after payment, or returned.'}
        </p>
      )}
    </>
  );
}

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => getOrder(id), [id]);
  const [local, setLocal] = useState(null);
  useEffect(() => setLocal(null), [id]);
  const view = local || data;

  if (error) return <p role="alert" className="text-maroon-700">{error} <Link to="/admin/orders" className="underline">Back to orders</Link></p>;
  if (loading && !view) return <p>Loading order...</p>;
  if (!view) return null;
  const { order, allowedNext, refund } = view;
  const a = order.shippingAddress;

  return (
    <>
      <Link to="/admin/orders" className="text-saffron-600 hover:underline">&larr; All orders</Link>
      <PageHeader title={`Order ${order.orderNumber}`}><StatusBadge status={order.status} /></PageHeader>
      <p className="-mt-4 mb-6 text-ink/70">Placed {fmt(order.createdAt)}{order.deliveredAt && ` · Delivered ${fmt(order.deliveredAt)}`}</p>

      {order.refundRequired && order.paymentStatus === 'paid' && (
        <p role="status" className="mb-6 rounded-md border border-maroon-700 bg-maroon-50 p-4 text-maroon-700">This order was paid, then cancelled. The customer is owed {formatPrice(order.pricing.total)}.</p>
      )}
      {order.returnRequest?.status === 'requested' && (
        <p role="status" className="mb-6 rounded-md border border-gold-400 bg-saffron-50 p-4"><strong>Return requested:</strong> &ldquo;{order.returnRequest.reason}&rdquo; ({fmt(order.returnRequest.requestedAt)})</p>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Box title="Update status"><StatusPanel order={order} allowedNext={allowedNext} onChanged={(o) => setLocal({ ...view, ...o })} /></Box>

          <Box title="Items">
            <ul className="divide-y divide-gold-300/50">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-4 py-2">
                  <span><span className="font-medium">{i.name}</span><br /><span className="text-sm text-ink/70">{i.sku}{i.variantLabel ? ` · ${i.variantLabel}` : ''} · {formatPrice(i.unitPrice)} × {i.quantity}</span></span>
                  <span className="font-semibold">{formatPrice(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </Box>

          <Box title="History">
            <ol className="space-y-2 border-l-2 border-gold-300 pl-4">
              {[...order.statusHistory].reverse().map((h, idx) => <li key={idx}><span className="font-medium text-maroon-800">{h.status}</span> <span className="text-sm text-ink/70">{fmt(h.at)}{h.note ? ` · ${h.note}` : ''}</span></li>)}
            </ol>
          </Box>
        </div>

        <div className="space-y-6">
          <Box title="Customer">
            <p>{order.user ? <Link to={`/admin/customers/${order.user._id}`} className="font-medium text-maroon-700 underline">{order.user.name}</Link> : 'Deleted user'}</p>
            {order.user && <p className="text-sm text-ink/70">{order.user.email}{order.user.phone ? ` · ${order.user.phone}` : ''}</p>}
          </Box>
          <Box title="Delivery address">
            <p>{a.fullName}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}</p>
            {order.shipment?.courier || order.shipment?.trackingId ? <p className="mt-2 text-sm"><strong>Shipment:</strong> {order.shipment.courier} {order.shipment.trackingId}</p> : null}
          </Box>
          <Box title="Payment">
            <dl className="space-y-1">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.pricing.subtotal)}</dd></div>
              {order.pricing.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon {order.coupon?.code}</dt><dd>-{formatPrice(order.pricing.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Shipping</dt><dd>{order.pricing.shippingCharge ? formatPrice(order.pricing.shippingCharge) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-gold-300 pt-2 text-lg font-semibold"><dt>Total</dt><dd>{formatPrice(order.pricing.total)}</dd></div>
            </dl>
            <p className="mt-2 text-sm text-ink/70">{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online (Razorpay)'} · {order.paymentStatus}{order.paidAt ? ` · ${fmt(order.paidAt)}` : ''}</p>
          </Box>
          <Box title="Refunds"><RefundPanel order={order} refund={refund} onChanged={(o) => setLocal({ ...view, ...o })} /></Box>
        </div>
      </div>
    </>
  );
}
