import crypto from 'crypto';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import ApiError from '../utils/ApiError.js';
import { getRazorpay } from '../config/razorpay.js';

const hmac = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('hex');

// Constant-time comparison, so response timing cannot leak the signature.
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Signature Razorpay's checkout returns after a payment: HMAC of "order_id|payment_id".
export const verifyCheckoutSignature = ({ razorpayOrderId, razorpayPaymentId, signature }, secret = process.env.RAZORPAY_KEY_SECRET) =>
  Boolean(secret) && safeEqual(hmac(`${razorpayOrderId}|${razorpayPaymentId}`, secret), signature);

// Webhook signature: HMAC of the exact raw request body.
export const verifyWebhookSignature = (rawBody, signature, secret = process.env.RAZORPAY_WEBHOOK_SECRET) =>
  Boolean(secret) && safeEqual(hmac(rawBody, secret), signature);

// Marks an order paid exactly once, whichever arrives first (browser verify call or webhook).
// Returns the order and whether this call was the one that changed it.
export const markOrderPaid = async (orderId, razorpayPaymentId) => {
  // Atomic claim: only one caller can move paymentStatus to 'paid'
  const before = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: { $in: ['pending', 'failed'] } },
    { $set: { paymentStatus: 'paid', paidAt: new Date() } },
    { new: false }
  );

  const current = before || (await Order.findById(orderId));
  if (razorpayPaymentId && current?.razorpayOrderId) {
    await Payment.updateOne({ razorpayOrderId: current.razorpayOrderId }, { $set: { status: 'captured', razorpayPaymentId } });
  }

  if (!before) return { order: current, changed: false }; // already paid

  if (before.status === 'Pending') {
    await Order.updateOne({ _id: orderId }, { $set: { status: 'Confirmed' }, $push: { statusHistory: { status: 'Confirmed', note: 'Payment received' } } });
    await Cart.updateOne({ user: before.user }, { items: [] });
  } else if (before.status === 'Cancelled') {
    // Paid after the order was cancelled (for example it expired): the store must refund it
    await Order.updateOne({ _id: orderId }, { $set: { refundRequired: true }, $push: { statusHistory: { status: 'Cancelled', note: 'Payment arrived after cancellation. A refund is due.' } } });
  }
  return { order: await Order.findById(orderId), changed: true };
};

// =====================  Refunds (Phase 5)  =====================
const round2 = (n) => Math.round(n * 100) / 100;

// An online order can be refunded when it was paid and is either cancelled-after-payment or returned.
const isRefundable = (order) =>
  order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid' &&
  ((order.status === 'Cancelled' && order.refundRequired) || order.status === 'Returned');

export const getRefundInfo = async (order) => {
  if (order.paymentMethod !== 'razorpay') return { eligible: false, refunded: 0, remaining: 0, refunds: [] };
  const payment = await Payment.findOne({ order: order._id, status: 'captured' });
  const refunds = payment?.refunds || [];
  const refunded = round2(refunds.reduce((n, r) => n + r.amount, 0));
  const remaining = round2(order.pricing.total - refunded);
  return { eligible: isRefundable(order) && Boolean(payment?.razorpayPaymentId) && remaining > 0, refunded, remaining, refunds };
};

// Sends a refund to Razorpay (money goes back to the customer's original payment method).
// `amount` in rupees; leave it out to refund everything that is left.
export const refundOrder = async (orderId, amount) => {
  const razorpay = getRazorpay();
  if (!razorpay) throw new ApiError(503, 'Razorpay is not set up on the server');

  // Lock so a double-click cannot send two refunds
  const order = await Order.findOneAndUpdate({ _id: orderId, refundLock: { $ne: true } }, { $set: { refundLock: true } }, { new: true });
  if (!order) throw new ApiError((await Order.exists({ _id: orderId })) ? 409 : 404, (await Order.exists({ _id: orderId })) ? 'A refund for this order is already in progress' : 'Order not found');

  try {
    const info = await getRefundInfo(order);
    if (!info.eligible) throw new ApiError(400, 'This order cannot be refunded right now (it must be paid online and either cancelled after payment or returned)');

    const value = amount === undefined || amount === null || amount === '' ? info.remaining : Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > info.remaining + 0.001) throw new ApiError(400, `Refund amount must be between 1 and ${info.remaining}`);

    const payment = await Payment.findOne({ order: order._id, status: 'captured' });
    let refund;
    try {
      refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(value * 100),
        speed: 'normal',
        receipt: `${order.orderNumber}-R${payment.refunds.length + 1}`,
        notes: { orderNumber: order.orderNumber },
      });
    } catch (err) {
      throw new ApiError(502, err?.error?.description || 'Razorpay could not process the refund');
    }

    payment.refunds.push({ refundId: refund.id, amount: value, status: refund.status === 'processed' ? 'processed' : 'created', at: new Date() });
    await payment.save();

    const full = round2(info.refunded + value) >= round2(order.pricing.total);
    const set = full ? { paymentStatus: 'refunded', refundRequired: false, ...(order.status === 'Returned' && { status: 'Refunded' }) } : {};
    await Order.updateOne(
      { _id: order._id },
      { ...(Object.keys(set).length && { $set: set }), $push: { statusHistory: { status: set.status || order.status, note: `${full ? 'Full' : 'Partial'} refund of Rs. ${value} sent to Razorpay` } } }
    );
  } finally {
    await Order.updateOne({ _id: orderId }, { $set: { refundLock: false } });
  }
  return Order.findById(orderId);
};
