import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { adminUpdateStatus, allowedNextStatuses } from '../services/orderService.js';
import { getRefundInfo, refundOrder } from '../services/paymentService.js';

// GET /api/admin/orders?status=&paymentStatus=&paymentMethod=&q=&page=
export const listOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, paymentMethod, q } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  const filter = {};
  if (status) filter.status = String(status);
  if (paymentStatus) filter.paymentStatus = String(paymentStatus);
  if (paymentMethod) filter.paymentMethod = String(paymentMethod);
  if (q?.trim()) {
    const rx = new RegExp(escapeRegex(q.trim().slice(0, 60)), 'i');
    const users = await User.find({ $or: [{ email: rx }, { name: rx }] }).select('_id').limit(50).lean();
    filter.$or = [{ orderNumber: rx }, { user: { $in: users.map((u) => u._id) } }];
  }

  const [data, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: { page, pages: Math.ceil(total / limit) || 1, total } });
});

// GET /api/admin/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = mongoose.isValidObjectId(req.params.id) ? await Order.findById(req.params.id).populate('user', 'name email phone') : null;
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: { order, allowedNext: allowedNextStatuses(order), refund: await getRefundInfo(order) } });
});

// PATCH /api/admin/orders/:id/status  { status, note?, courier?, trackingId?, restock? }
export const updateStatus = asyncHandler(async (req, res) => {
  const order = await adminUpdateStatus(req.params.id, req.body);
  res.json({ success: true, data: { order, allowedNext: allowedNextStatuses(order), refund: await getRefundInfo(order) } });
});

// POST /api/admin/orders/:id/refund  { amount? }
export const refund = asyncHandler(async (req, res) => {
  const order = await refundOrder(req.params.id, req.body.amount);
  res.json({ success: true, data: { order, allowedNext: allowedNextStatuses(order), refund: await getRefundInfo(order) } });
});
