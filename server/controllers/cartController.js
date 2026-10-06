import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { MAX_QTY_PER_ITEM, resolveLine } from '../utils/calculatePrice.js';
import { buildCart, PRODUCT_FIELDS } from '../services/cartService.js';

const parseQty = (value) => {
  const q = Number(value);
  if (!Number.isInteger(q) || q < 1) throw new ApiError(400, 'Quantity must be a whole number of at least 1');
  return q;
};

const checkId = (id, label = 'product') => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`);
  return id;
};

const sameLine = (item, productId, variantId) =>
  String(item.product._id || item.product) === String(productId) && String(item.variantId || '') === String(variantId || '');

const loadLine = async (productId, variantId) => {
  const product = await Product.findOne({ _id: checkId(productId), isActive: true }).select(PRODUCT_FIELDS);
  if (!product) throw new ApiError(404, 'Product not found');
  return { product, info: resolveLine(product, variantId ? checkId(variantId, 'option') : null) };
};

const assertQty = (qty, info) => {
  if (info.stock < 1) throw new ApiError(400, 'This item is out of stock');
  const max = Math.min(info.stock, MAX_QTY_PER_ITEM);
  if (qty > max) throw new ApiError(400, `Only ${max} available for this item`);
};

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await buildCart(req.user._id) });
});

// POST /api/cart/add  { productId, variantId?, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;
  const qty = parseQty(req.body.quantity ?? 1);
  const { info } = await loadLine(productId, variantId);

  const cart = (await Cart.findOne({ user: req.user._id })) || new Cart({ user: req.user._id, items: [] });
  const line = cart.items.find((i) => sameLine(i, productId, info.variant?._id));
  assertQty((line?.quantity || 0) + qty, info);

  if (line) line.quantity += qty;
  else cart.items.push({ product: productId, variantId: info.variant?._id, quantity: qty });
  await cart.save();

  res.json({ success: true, data: await buildCart(req.user._id) });
});

// PUT /api/cart/update  { productId, variantId?, quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;
  const qty = parseQty(req.body.quantity);
  const { info } = await loadLine(productId, variantId);

  const cart = await Cart.findOne({ user: req.user._id });
  const line = cart?.items.find((i) => sameLine(i, productId, info.variant?._id));
  if (!line) throw new ApiError(404, 'Item is not in your cart');
  assertQty(qty, info);

  line.quantity = qty;
  await cart.save();
  res.json({ success: true, data: await buildCart(req.user._id) });
});

// DELETE /api/cart/remove/:productId?variantId=
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId } = req.query;
  checkId(productId);

  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    const keep = cart.items.filter((i) => !sameLine(i, productId, variantId));
    cart.items = keep;
    await cart.save();
  }
  res.json({ success: true, data: await buildCart(req.user._id) });
});
