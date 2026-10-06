import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/common/Seo';
import Loader from '../components/common/Loader';
import AddressForm from '../components/checkout/AddressForm';
import CouponBox from '../components/checkout/CouponBox';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentMethods from '../components/checkout/PaymentMethods';
import ProductImage from '../components/product/ProductImage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { formatPrice } from '../utils/formatPrice';
import * as userService from '../services/userService';
import { createOrder, getQuote } from '../services/orderService';
import { payForOrder, PAYMENT_CANCELLED } from '../services/paymentService';

const Step = ({ n, title, children }) => (
  <section className="rounded-lg border border-gold-300 bg-white p-5 sm:p-6">
    <h2 className="mb-4 text-2xl font-semibold"><span className="mr-2 text-saffron-600">{n}.</span>{title}</h2>
    {children}
  </section>
);

export default function Checkout() {
  const { user } = useAuth();
  const { cart, loading: cartLoading, reload } = useCart();
  const settings = useSettings();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [quote, setQuote] = useState(null);
  const [method, setMethod] = useState(null);
  const [placing, setPlacing] = useState(false);
  const finished = useRef(false); // stops the "cart is empty" redirect from firing after we clear the cart

  const loadAddresses = useCallback(async (selectId) => {
    const list = await userService.getAddresses();
    setAddresses(list);
    setAddressId((cur) => selectId || (list.some((a) => a._id === cur) ? cur : (list.find((a) => a.isDefault) || list[0])?._id || null));
    if (list.length === 0) setAddingAddress(true);
  }, []);

  useEffect(() => { loadAddresses().catch((e) => toast.error(e.message)); }, [loadAddresses]);

  // Totals always come from the server
  useEffect(() => {
    if (cartLoading || cart.items.length === 0) return undefined;
    let cancelled = false;
    getQuote(coupon)
      .then((q) => { if (!cancelled) setQuote(q); }) // the coupon error is cleared only when the shopper applies or removes a code
      .catch((err) => {
        if (cancelled) return;
        if (coupon) { setCouponError(err.message); setCoupon(''); } else toast.error(err.message);
      });
    return () => { cancelled = true; };
  }, [coupon, cart.items.length, cartLoading]);

  // Pick a sensible default payment method once settings arrive
  useEffect(() => {
    if (settings && !method) setMethod(settings.onlinePaymentsEnabled ? 'razorpay' : settings.codEnabled ? 'cod' : null);
  }, [settings, method]);

  // Nothing to check out
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0 && !finished.current) navigate('/cart', { replace: true });
  }, [cartLoading, cart.items.length, navigate]);

  const saveAddress = async (values) => {
    try {
      const created = await userService.addAddress(values);
      setAddingAddress(false);
      await loadAddresses(created._id);
      toast.success('Address saved');
    } catch (err) { toast.error(err.message); }
  };

  const needsVerification = settings?.requireVerifiedEmail && !user.isEmailVerified;
  const canPlace = !placing && addressId && method && quote && !cart.hasIssues && !needsVerification;

  const placeOrder = async () => {
    setPlacing(true);
    let order;
    try {
      order = await createOrder({ addressId, paymentMethod: method, couponCode: quote?.coupon?.code });
    } catch (err) {
      toast.error(err.message);
      reload().catch(() => {}); // the cart may have changed (stock), so refresh it
      setPlacing(false);
      return;
    }

    finished.current = true;
    if (method === 'cod') {
      await reload().catch(() => {});
      navigate(`/order-success/${order._id}`, { replace: true });
      return;
    }
    try {
      await payForOrder(order._id);
      await reload().catch(() => {});
      navigate(`/order-success/${order._id}`, { replace: true });
    } catch (err) {
      // The order exists; the shopper can pay again from its page
      toast(err.message === PAYMENT_CANCELLED ? 'Payment was not completed. You can pay from your order page.' : err.message, { duration: 6000 });
      navigate(`/orders/${order._id}`, { replace: true });
    }
  };

  if (cartLoading || !settings || addresses === null) return <Loader label="Preparing checkout" />;

  return (
    <div className="container-page py-10">
      <Seo title="Checkout" />
      <h1 className="text-4xl font-bold">Checkout</h1>

      {needsVerification && (
        <p role="alert" className="mt-4 rounded-md border border-gold-400 bg-saffron-50 p-4">
          Please verify your email address before placing an order. <Link to="/profile" className="font-medium text-maroon-700 underline">Go to your account</Link> to resend the link.
        </p>
      )}
      {cart.hasIssues && (
        <p role="alert" className="mt-4 rounded-md bg-maroon-50 p-4 text-maroon-700">
          Some items in your cart are out of stock or changed. <Link to="/cart" className="underline">Review your cart</Link> first.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Step n={1} title="Review your items">
            <ul className="divide-y divide-gold-300/60">
              {cart.items.map((i) => (
                <li key={`${i.productId}-${i.variantId || ''}`} className="flex items-center gap-4 py-3">
                  <ProductImage product={{ name: i.name, images: i.image ? [{ url: i.image }] : [] }} className="h-16 w-16 shrink-0 rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-maroon-800">{i.name}</p>
                    <p className="text-sm text-ink/70">{i.variantLabel ? `${i.variantLabel} · ` : ''}Qty {i.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <Link to="/cart" className="mt-2 inline-block text-sm text-saffron-600 hover:underline">Edit cart</Link>
          </Step>

          <Step n={2} title="Delivery address">
            {addingAddress ? (
              <AddressForm onSubmit={saveAddress} onCancel={addresses.length ? () => setAddingAddress(false) : undefined} />
            ) : (
              <>
                <fieldset>
                  <legend className="sr-only">Choose a delivery address</legend>
                  <div className="grid gap-3 md:grid-cols-2">
                    {addresses.map((a) => (
                      <label key={a._id} className={`flex cursor-pointer gap-3 rounded-md border p-4 ${addressId === a._id ? 'border-maroon-700 bg-maroon-50' : 'border-gold-300'}`}>
                        <input type="radio" name="address" checked={addressId === a._id} onChange={() => setAddressId(a._id)} className="mt-1 accent-maroon-700" />
                        <span className="text-sm">
                          <span className="block font-semibold text-maroon-800">{a.fullName} ({a.label})</span>
                          {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button type="button" onClick={() => setAddingAddress(true)} className="mt-3 text-maroon-700 underline">Add a new address</button>
              </>
            )}
          </Step>

          <Step n={3} title="Shipping">
            <div className="flex justify-between rounded-md border border-maroon-700 bg-maroon-50 p-4">
              <span><strong className="text-maroon-800">Standard delivery</strong><br /><span className="text-sm text-ink/70">Dispatched in 1-3 working days</span></span>
              <span className="font-semibold">{quote ? (quote.shippingCharge === 0 ? 'Free' : formatPrice(quote.shippingCharge)) : '...'}</span>
            </div>
          </Step>

          <Step n={4} title="Coupon">
            <CouponBox applied={quote?.coupon?.code} error={couponError} onApply={(c) => { setCouponError(''); setCoupon(c); }} onRemove={() => setCoupon('')} />
          </Step>

          <Step n={5} title="Payment method">
            <PaymentMethods settings={settings} value={method} onChange={setMethod} />
          </Step>
        </div>

        <OrderSummary quote={quote}>
          <button onClick={placeOrder} disabled={!canPlace}
            className="mt-6 w-full rounded-md bg-saffron-500 py-3 font-medium text-white hover:bg-saffron-600 disabled:cursor-not-allowed disabled:opacity-60">
            {placing ? 'Placing order...' : method === 'razorpay' ? 'Pay now' : 'Place order'}
          </button>
          {!addressId && <p className="mt-2 text-sm text-ink/70">Choose or add a delivery address to continue.</p>}
          <p className="mt-3 text-xs text-ink/60">By placing your order you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/return-policy" className="underline">Return Policy</Link>.</p>
        </OrderSummary>
      </div>
    </div>
  );
}
