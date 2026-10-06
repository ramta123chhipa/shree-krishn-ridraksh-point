import mongoose from 'mongoose';
import Address from '../models/Address.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import generateOrderNumber from '../utils/generateOrderId.js';
import { buildPricing, couponDiscount } from '../utils/calculatePrice.js';
import { razorpayConfigured } from '../config/razorpay.js';
import { buildCart } from './cartService.js';
import { reserveStock, restoreStock } from './inventoryService.js';

const UNPAID_ORDER_MINUTES = 30;

export const requireVerifiedEmail = () => process.env.REQUIRE_VERIFIED_EMAIL !== 'false';

// ---------- coupons ----------
// Checks a coupon against the current cart. Throws a readable error if it cannot be used.
export const validateCoupon = async (code, userId, subtotal) => {
  const coupon = await Coupon.findOne({ code: String(code || '').trim().toUpperCase() });
  if (!coupon || !coupon.isActive) throw new ApiError(400, 'This coupon code is not valid');

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new ApiError(400, 'This coupon is not active yet');
  if (coupon.expiresAt && coupon.expiresAt < now) throw new ApiError(400, 'This coupon has expired');
  if (subtotal < coupon.minOrderValue) throw new ApiError(400, `This coupon needs a minimum order of Rs. ${coupon.minOrderValue}`);
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, 'This coupon has been fully used');

  const used = await Order.countDocuments({ user: userId, 'coupon.code': coupon.code, status: { $ne: 'Cancelled' } });
  if (used >= coupon.perUserLimit) throw new ApiError(400, 'You have already used this coupon');

  const discount = couponDiscount(coupon, subtotal);
  if (discount <= 0) throw new ApiError(400, 'This coupon gives no discount on your order');
  return { coupon, discount };
};

// Counts the use atomically, so a limited coupon cannot be over-used by simultaneous orders.
const redeemCoupon = async (coupon) => {
  const filter = { _id: coupon._id, ...(coupon.usageLimit > 0 && { $expr: { $lt: ['$usedCount', '$usageLimit'] } }) };
  const res = await Coupon.updateOne(filter, { $inc: { usedCount: 1 } });
  if (res.modifiedCount === 0) throw new ApiError(400, 'This coupon is no longer available');
};
const releaseCoupon = (code) => (code ? Coupon.updateOne({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }) : null);

// ---------- quote (no side effects) ----------
export const getQuote = async (userId, couponCode) => {
  const cart = await buildCart(userId);
  if (!cart.items.length) throw new ApiError(400, 'Your cart is empty');
  let discount = 0;
  let coupon = null;
  if (couponCode) ({ coupon, discount } = await validateCoupon(couponCode, userId, cart.subtotal));
  return {
    ...buildPricing(cart.subtotal, discount),
    hasIssues: cart.hasIssues,
    coupon: coupon ? { code: coupon.code, description: coupon.description } : null,
  };
};

// ---------- cancelling ----------
// Cancels an order once (safe to call twice), then returns stock and the coupon use.
export const cancelOrder = async (orderId, { allowedStatuses, note, userId }) => {
  const filter = { _id: orderId, status: { $in: allowedStatuses }, ...(userId && { user: userId }) };
  const order = await Order.findOneAndUpdate(
    filter,
    { $set: { status: 'Cancelled', cancelledAt: new Date() }, $push: { statusHistory: { status: 'Cancelled', note } } },
    { new: true }
  );
  if (!order) throw new ApiError(400, 'This order can no longer be cancelled');

  await restoreStock(order.items);
  await releaseCoupon(order.coupon?.code);
  if (order.paymentStatus === 'paid') {
    // Money was taken online: flag it so the store refunds it
    await Order.updateOne({ _id: order._id }, { refundRequired: true, $push: { statusHistory: { status: 'Cancelled', note: 'Payment was received. A refund is due.' } } });
    order.refundRequired = true;
  }
  return order;
};

// Unpaid online orders from this user (they started paying, then left) free their stock before a new order.
const cancelStaleUnpaidOrders = async (userId) => {
  const stale = await Order.find({ user: userId, paymentMethod: 'razorpay', paymentStatus: { $in: ['pending', 'failed'] }, status: 'Pending' }).select('_id');
  for (const o of stale) {
    await cancelOrder(o._id, { allowedStatuses: ['Pending'], note: 'Replaced by a newer order' }).catch(() => {});
  }
};

// Run on a timer (see server.js): online orders nobody paid for within 30 minutes give their stock back.
export const expireUnpaidOrders = async () => {
  const cutoff = new Date(Date.now() - UNPAID_ORDER_MINUTES * 60 * 1000);
  const stale = await Order.find({ paymentMethod: 'razorpay', paymentStatus: { $in: ['pending', 'failed'] }, status: 'Pending', createdAt: { $lt: cutoff } }).select('_id');
  for (const o of stale) {
    await cancelOrder(o._id, { allowedStatuses: ['Pending'], note: 'Payment not completed in time' }).catch(() => {});
  }
  return stale.length;
};

// ---------- creating an order ----------
const saveWithUniqueNumber = async (data) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await Order.create({ ...data, orderNumber: generateOrderNumber() });
    } catch (err) {
      if (!(err.code === 11000 && err.keyPattern?.orderNumber)) throw err;
    }
  }
  throw new ApiError(500, 'Could not create the order. Please try again.');
};

export const createOrder = async (user, { addressId, paymentMethod, couponCode }) => {
  if (!['cod', 'razorpay'].includes(paymentMethod)) throw new ApiError(400, 'Please choose a payment method');
  if (paymentMethod === 'cod' && !(await Setting.get()).codEnabled) throw new ApiError(400, 'Cash on delivery is not available right now');
  if (paymentMethod === 'razorpay' && !razorpayConfigured()) throw new ApiError(400, 'Online payment is not available right now');
  if (requireVerifiedEmail() && !user.isEmailVerified) throw new ApiError(403, 'Please verify your email address before placing an order');

  if (!mongoose.isValidObjectId(addressId)) throw new ApiError(400, 'Please choose a delivery address');
  const address = await Address.findOne({ _id: addressId, user: user._id }).lean();
  if (!address) throw new ApiError(400, 'Please choose a delivery address');

  // Prices and stock always come from the database, never from the browser
  const cart = await buildCart(user._id);
  if (!cart.items.length) throw new ApiError(400, 'Your cart is empty');
  if (cart.hasIssues) throw new ApiError(409, 'Some items in your cart changed (stock or quantity). Please review your cart.');

  let coupon = null;
  let discount = 0;
  if (couponCode) ({ coupon, discount } = await validateCoupon(couponCode, user._id, cart.subtotal));
  const pricing = buildPricing(cart.subtotal, discount);

  const items = cart.items.map((i) => ({
    product: i.productId,
    variantId: i.variantId || undefined,
    name: i.name,
    sku: i.sku,
    image: i.image || undefined,
    variantLabel: i.variantLabel || undefined,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    lineTotal: Math.round(i.unitPrice * i.quantity * 100) / 100,
  }));

  await cancelStaleUnpaidOrders(user._id);
  await reserveStock(items);

  let redeemed = false;
  try {
    if (coupon) { await redeemCoupon(coupon); redeemed = true; }
    const { fullName, phone, line1, line2, city, state, pincode, country } = address;
    const order = await saveWithUniqueNumber({
      user: user._id,
      items,
      shippingAddress: { fullName, phone, line1, line2, city, state, pincode, country },
      pricing,
      coupon: coupon ? { code: coupon.code, description: coupon.description } : undefined,
      paymentMethod,
      statusHistory: [{ status: 'Pending', note: paymentMethod === 'cod' ? 'Order placed (cash on delivery)' : 'Order placed, waiting for payment' }],
    });
    // Cash on delivery is final now. Online orders clear the cart once payment is confirmed.
    if (paymentMethod === 'cod') await Cart.updateOne({ user: user._id }, { items: [] });
    return order;
  } catch (err) {
    await restoreStock(items);
    if (redeemed) await releaseCoupon(coupon.code);
    throw err;
  }
};

// =====================  Admin order handling (Phase 5)  =====================
// Which status an order may move to next. Cancelling is handled separately so stock is returned.
const NEXT_STATUS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Out for Delivery', 'Delivered'],
  'Out for Delivery': ['Delivered'],
  'Return Requested': ['Returned', 'Delivered'], // Returned = approve, Delivered = decline
  Returned: ['Refunded'],
};

export const allowedNextStatuses = (order) =>
  (NEXT_STATUS[order.status] || []).filter((s) => {
    if (s === 'Confirmed' && order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid') return false; // never confirm unpaid online orders
    if (s === 'Refunded' && order.paymentMethod === 'razorpay') return false; // online refunds go through the Refund button
    return true;
  });

const clean = (v, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const adminUpdateStatus = async (orderId, { status, note, courier, trackingId, restock }) => {
  const order = mongoose.isValidObjectId(orderId) ? await Order.findById(orderId) : null;
  if (!order) throw new ApiError(404, 'Order not found');
  if (!allowedNextStatuses(order).includes(status)) throw new ApiError(400, `An order that is "${order.status}" cannot be moved to "${status}"`);

  if (status === 'Cancelled') {
    return cancelOrder(order._id, { allowedStatuses: ['Pending', 'Confirmed', 'Processing'], note: clean(note, 200) || 'Cancelled by the store' });
  }

  const set = { status };
  const history = { status, note: clean(note, 200) };
  const now = new Date();

  if (status === 'Shipped') set.shipment = { courier: clean(courier, 60), trackingId: clean(trackingId, 60) };
  if (status === 'Delivered') {
    if (order.status === 'Return Requested') {
      set['returnRequest.status'] = 'rejected';
      set['returnRequest.resolvedAt'] = now;
      history.note = history.note || 'Return request declined';
    } else {
      set.deliveredAt = now;
      if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') { set.paymentStatus = 'paid'; set.paidAt = now; } // cash collected
    }
  }
  if (status === 'Returned') {
    set['returnRequest.status'] = 'approved';
    set['returnRequest.resolvedAt'] = now;
    if (restock === true) history.note = history.note || 'Items returned to stock';
  }
  if (status === 'Refunded') { set.paymentStatus = 'refunded'; set.refundRequired = false; }

  // Only succeeds if nobody changed the order in the meantime
  const updated = await Order.findOneAndUpdate({ _id: order._id, status: order.status }, { $set: set, $push: { statusHistory: history } }, { new: true });
  if (!updated) throw new ApiError(409, 'This order was just changed. Please refresh and try again.');
  if (status === 'Returned' && restock === true) await restoreStock(updated.items);
  return updated;
};

// Customer asks to return a delivered order (within the return window).
export const requestReturn = async (orderId, userId, reason) => {
  const days = Number(process.env.RETURN_WINDOW_DAYS) || 7;
  const text = clean(reason, 500);
  if (text.length < 5) throw new ApiError(400, 'Please tell us why you want to return the order (at least 5 characters)');

  const order = mongoose.isValidObjectId(orderId) ? await Order.findOne({ _id: orderId, user: userId }) : null;
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== 'Delivered') throw new ApiError(400, 'Only delivered orders can be returned');
  if (order.returnRequest?.status) throw new ApiError(400, 'A return has already been requested for this order');
  if (!order.deliveredAt || Date.now() - order.deliveredAt.getTime() > days * 24 * 60 * 60 * 1000) {
    throw new ApiError(400, `The ${days}-day return window for this order has passed`);
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: 'Delivered', 'returnRequest.status': { $exists: false } },
    { $set: { status: 'Return Requested', returnRequest: { reason: text, status: 'requested', requestedAt: new Date() } }, $push: { statusHistory: { status: 'Return Requested', note: 'Return requested by customer' } } },
    { new: true }
  );
  if (!updated) throw new ApiError(409, 'This order was just updated. Please refresh and try again.');
  return updated;
};
