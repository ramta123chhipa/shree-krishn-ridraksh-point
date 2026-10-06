import mongoose from 'mongoose';
import Address from '../models/Address.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { effectiveStock, effectiveStockExpr, lowStockThreshold } from '../utils/stock.js';
import { parseCouponInput } from '../validators/adminValidator.js';

// Money counts as revenue once it is paid (online) or collected (cash on delivery, when delivered),
// and the order has not been cancelled or returned.
const REVENUE = { paymentStatus: 'paid', status: { $nin: ['Cancelled', 'Returned', 'Refunded'] } };
const istDay = (d) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

// GET /api/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const days = 30;
  const since = new Date(Date.now() - (days + 1) * 24 * 60 * 60 * 1000); // a day of slack, so the first chart day is complete in any timezone

  const [revenueAgg, orders, customers, products, pending, lowStock, lowStockCount, recentOrders, daily, byStatus] = await Promise.all([
    Order.aggregate([{ $match: REVENUE }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Product.find({ isActive: true, $expr: { $lte: [effectiveStockExpr, lowStockThreshold()] } }).select('name sku stock variants').limit(10).lean(),
    Product.countDocuments({ isActive: true, $expr: { $lte: [effectiveStockExpr, lowStockThreshold()] } }),
    Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(8).select('orderNumber user pricing.total status paymentMethod paymentStatus createdAt').lean(),
    Order.aggregate([
      { $match: { ...REVENUE, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  // One entry per day, including days with no sales
  const byDay = Object.fromEntries(daily.map((d) => [d._id, d]));
  const salesByDay = Array.from({ length: days }, (_, i) => {
    const date = istDay(new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000));
    return { date, revenue: byDay[date]?.revenue || 0, orders: byDay[date]?.orders || 0 };
  });

  res.json({
    success: true,
    data: {
      stats: { revenue: revenueAgg[0]?.total || 0, orders, customers, products, pendingOrders: pending, lowStockCount },
      lowStock: lowStock.map((p) => ({ _id: p._id, name: p.name, sku: p.sku, stock: effectiveStock(p) })),
      lowStockThreshold: lowStockThreshold(),
      recentOrders,
      salesByDay,
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.n])),
    },
  });
});

// ---------- customers ----------
const SPENT = { $sum: { $cond: [{ $and: [{ $eq: ['$paymentStatus', 'paid'] }, { $not: [{ $in: ['$status', ['Cancelled', 'Returned', 'Refunded']] }] }] }, '$pricing.total', 0] } };

// GET /api/admin/customers?q=&page=
export const listCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 20;
  const filter = { role: 'customer' };
  if (req.query.q?.trim()) {
    const rx = new RegExp(escapeRegex(req.query.q.trim().slice(0, 60)), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('name email phone isActive isEmailVerified createdAt').lean(),
    User.countDocuments(filter),
  ]);
  const stats = await Order.aggregate([{ $match: { user: { $in: users.map((u) => u._id) } } }, { $group: { _id: '$user', orders: { $sum: 1 }, spent: SPENT } }]);
  const byUser = Object.fromEntries(stats.map((s) => [String(s._id), s]));
  res.json({
    success: true,
    data: users.map((u) => ({ ...u, orders: byUser[String(u._id)]?.orders || 0, spent: byUser[String(u._id)]?.spent || 0 })),
    pagination: { page, pages: Math.ceil(total / limit) || 1, total },
  });
});

// GET /api/admin/customers/:id
export const getCustomer = asyncHandler(async (req, res) => {
  const user = mongoose.isValidObjectId(req.params.id) ? await User.findOne({ _id: req.params.id, role: 'customer' }).select('name email phone isActive isEmailVerified createdAt').lean() : null;
  if (!user) throw new ApiError(404, 'Customer not found');
  const [addresses, orders] = await Promise.all([
    Address.find({ user: user._id }).sort({ isDefault: -1 }).lean(),
    Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).select('orderNumber pricing.total status paymentMethod paymentStatus createdAt').lean(),
  ]);
  res.json({ success: true, data: { user, addresses, orders } });
});

// PATCH /api/admin/customers/:id/status  { isActive }   (a blocked customer is logged out on their next request)
export const setCustomerStatus = asyncHandler(async (req, res) => {
  if (typeof req.body.isActive !== 'boolean') throw new ApiError(400, 'isActive must be true or false');
  const user = mongoose.isValidObjectId(req.params.id)
    ? await User.findOneAndUpdate({ _id: req.params.id, role: 'customer' }, { isActive: req.body.isActive }, { new: true }).select('name email isActive')
    : null;
  if (!user) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, data: user });
});

// ---------- coupons ----------
export const listCoupons = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Coupon.find().sort({ createdAt: -1 }).lean() });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const data = parseCouponInput(req.body);
  if (await Coupon.exists({ code: data.code })) throw new ApiError(409, 'A coupon with this code already exists');
  res.status(201).json({ success: true, data: await Coupon.create(data) });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = mongoose.isValidObjectId(req.params.id) ? await Coupon.findById(req.params.id) : null;
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  const data = parseCouponInput(req.body);
  // Usage limits are counted by code, so a used coupon keeps its code
  if (data.code !== coupon.code) {
    if (coupon.usedCount > 0) throw new ApiError(400, 'This coupon has been used, so its code cannot change. Create a new coupon instead.');
    if (await Coupon.exists({ code: data.code })) throw new ApiError(409, 'A coupon with this code already exists');
  }
  coupon.set({ ...data, maxDiscount: data.maxDiscount ?? undefined });
  await coupon.save();
  res.json({ success: true, data: coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = mongoose.isValidObjectId(req.params.id) ? await Coupon.findById(req.params.id) : null;
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  if (coupon.usedCount > 0) throw new ApiError(409, 'This coupon has been used. Switch it off instead of deleting it, so order history stays accurate.');
  await Coupon.deleteOne({ _id: coupon._id });
  res.json({ success: true, message: 'Coupon deleted' });
});

// ---------- store settings ----------
export const getSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Setting.get() });
});

export const updateSettings = asyncHandler(async (req, res) => {
  if (typeof req.body.codEnabled !== 'boolean') throw new ApiError(400, 'codEnabled must be true or false');
  const settings = await Setting.findOneAndUpdate({ key: 'main' }, { $set: { codEnabled: req.body.codEnabled } }, { upsert: true, new: true });
  res.json({ success: true, data: settings });
});
