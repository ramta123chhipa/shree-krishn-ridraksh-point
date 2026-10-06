import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const MAX_ITEMS = 100;

const load = async (userId) => {
  const wl = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    match: { isActive: true },
    select: '-description -specifications',
    populate: { path: 'category', select: 'name slug' },
  });
  return (wl?.products || []).filter(Boolean);
};

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await load(req.user._id) });
});

// POST /api/wishlist  { productId }
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!mongoose.isValidObjectId(productId)) throw new ApiError(400, 'Invalid product');
  if (!(await Product.exists({ _id: productId, isActive: true }))) throw new ApiError(404, 'Product not found');

  const existing = await Wishlist.findOne({ user: req.user._id });
  if (existing && existing.products.length >= MAX_ITEMS && !existing.products.some((p) => String(p) === String(productId))) {
    throw new ApiError(400, `Wishlist can hold up to ${MAX_ITEMS} products`);
  }
  await Wishlist.updateOne({ user: req.user._id }, { $addToSet: { products: productId } }, { upsert: true });
  res.status(201).json({ success: true, data: await load(req.user._id) });
});

// DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) throw new ApiError(400, 'Invalid product');
  await Wishlist.updateOne({ user: req.user._id }, { $pull: { products: req.params.productId } });
  res.json({ success: true, data: await load(req.user._id) });
});
