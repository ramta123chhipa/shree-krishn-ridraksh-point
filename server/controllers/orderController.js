import mongoose from 'mongoose';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cancelOrder, createOrder, getQuote, requestReturn } from '../services/orderService.js';

const findOwn = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Order not found');
  const order = await Order.findOne({ _id: id, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

// POST /api/orders/quote  { couponCode? }  -> totals for the current cart, nothing is saved
export const quote = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getQuote(req.user._id, req.body.couponCode) });
});

// POST /api/orders  { addressId, paymentMethod: 'cod' | 'razorpay', couponCode? }
export const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, couponCode } = req.body;
  const order = await createOrder(req.user, { addressId, paymentMethod, couponCode });
  res.status(201).json({ success: true, data: order });
});

// GET /api/orders/my-orders
export const myOrders = asyncHandler(async (req, res) => {
  const data = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, data });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await findOwn(req.params.id, req.user._id) });
});

// PATCH /api/orders/:id/cancel   (only before the store starts processing it)
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await findOwn(req.params.id, req.user._id);
  const cancelled = await cancelOrder(order._id, { allowedStatuses: ['Pending', 'Confirmed'], note: 'Cancelled by customer', userId: req.user._id });
  res.json({ success: true, data: cancelled });
});

// POST /api/orders/:id/return  { reason }   (delivered orders, within the return window)
export const returnMyOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await requestReturn(req.params.id, req.user._id, req.body.reason) });
});
