import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import WebhookEvent from '../models/WebhookEvent.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getRazorpay, razorpayConfigured } from '../config/razorpay.js';
import { markOrderPaid, verifyCheckoutSignature, verifyWebhookSignature } from '../services/paymentService.js';

const toPaise = (rupees) => Math.round(rupees * 100);

const findOwnOrder = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Order not found');
  const order = await Order.findOne({ _id: id, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

// POST /api/payments/create-order  { orderId }
// The amount comes from our saved order, never from the browser.
export const createPaymentOrder = asyncHandler(async (req, res) => {
  if (!razorpayConfigured()) throw new ApiError(503, 'Online payment is not available right now');
  const order = await findOwnOrder(req.body.orderId, req.user._id);
  if (order.paymentMethod !== 'razorpay') throw new ApiError(400, 'This order is not an online-payment order');
  if (order.paymentStatus === 'paid') throw new ApiError(400, 'This order is already paid');
  if (order.status !== 'Pending') throw new ApiError(400, 'This order can no longer be paid');

  if (!order.razorpayOrderId) {
    const rzOrder = await getRazorpay().orders.create({
      amount: toPaise(order.pricing.total),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: String(order._id), orderNumber: order.orderNumber },
    });
    order.razorpayOrderId = rzOrder.id;
    await order.save();
    await Payment.create({ order: order._id, user: req.user._id, razorpayOrderId: rzOrder.id, amount: order.pricing.total });
  }

  res.json({
    success: true,
    data: {
      keyId: process.env.RAZORPAY_KEY_ID, // public key; the secret never leaves the server
      razorpayOrderId: order.razorpayOrderId,
      amount: toPaise(order.pricing.total),
      currency: 'INR',
      orderId: order._id,
      orderNumber: order.orderNumber,
      prefill: { name: req.user.name, email: req.user.email, contact: req.user.phone || '' },
    },
  });
});

// POST /api/payments/verify  { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Payment counts only if the signature checks out. The browser's "success" is never trusted on its own.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id: rzOrderId, razorpay_payment_id: rzPaymentId, razorpay_signature: signature } = req.body;
  const order = await findOwnOrder(orderId, req.user._id);

  if (!order.razorpayOrderId || order.razorpayOrderId !== rzOrderId) throw new ApiError(400, 'Payment does not match this order');
  if (!verifyCheckoutSignature({ razorpayOrderId: rzOrderId, razorpayPaymentId: rzPaymentId, signature })) {
    throw new ApiError(400, 'Payment verification failed. If money was deducted, it will be refunded or confirmed shortly.');
  }

  const { order: paid } = await markOrderPaid(order._id, rzPaymentId);
  res.json({ success: true, data: paid });
});

// POST /api/payments/webhook  (called by Razorpay, signed with RAZORPAY_WEBHOOK_SECRET)
// req.body is the raw bytes (see app.js), which the signature needs.
export const webhook = asyncHandler(async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!verifyWebhookSignature(raw, req.headers['x-razorpay-signature'])) throw new ApiError(400, 'Invalid signature');

  const event = JSON.parse(raw);
  const eventId = req.headers['x-razorpay-event-id'] || `${event.event}:${event.payload?.payment?.entity?.id}`;

  // Duplicate delivery: acknowledge and do nothing
  try {
    await WebhookEvent.create({ eventId, type: event.event });
  } catch (err) {
    if (err.code === 11000) return res.json({ success: true, duplicate: true });
    throw err;
  }

  try {
    const refund = event.payload?.refund?.entity;
    if (refund?.id && (event.event === 'refund.processed' || event.event === 'refund.failed')) {
      await Payment.updateOne({ 'refunds.refundId': refund.id }, { $set: { 'refunds.$.status': event.event === 'refund.processed' ? 'processed' : 'failed' } });
    }
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order && event.event === 'payment.captured') {
        if (toPaise(order.pricing.total) === payment.amount) await markOrderPaid(order._id, payment.id);
        else console.warn(`Webhook amount mismatch for ${order.orderNumber}; not marked paid`);
      } else if (order && event.event === 'payment.failed' && order.paymentStatus === 'pending') {
        await Order.updateOne({ _id: order._id, paymentStatus: 'pending' }, { paymentStatus: 'failed' });
        await Payment.updateOne({ razorpayOrderId: payment.order_id, status: 'created' }, { status: 'failed', failureReason: payment.error_description });
      }
    }
  } catch (err) {
    // Let Razorpay retry: forget this event id so the retry is processed
    await WebhookEvent.deleteOne({ eventId });
    throw err;
  }
  res.json({ success: true });
});
