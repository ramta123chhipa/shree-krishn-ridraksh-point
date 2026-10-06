import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

const text = (v, label, { min = 1, max = 200 } = {}) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length < min || s.length > max) throw new ApiError(400, `${label} must be ${min} to ${max} characters`);
  return s;
};

const num = (v, label, { min = 0, integer = false } = {}) => {
  const n = typeof v === 'string' ? Number(v.trim()) : v;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) {
    throw new ApiError(400, `${label} must be ${integer ? 'a whole number' : 'a number'} of at least ${min}`);
  }
  return n;
};

const bool = (v) => v === true || v === 'true';
const blank = (v) => v === undefined || v === null || v === '';

const parseVariants = (list) => {
  if (!Array.isArray(list)) throw new ApiError(400, 'Options must be a list');
  if (list.length > 20) throw new ApiError(400, 'A product can have up to 20 options');
  return list.map((v, i) => {
    const out = { label: text(v?.label, `Option ${i + 1} name`, { max: 60 }), stock: num(v?.stock ?? 0, `Option ${i + 1} stock`, { integer: true }) };
    if (!blank(v.price)) out.price = num(v.price, `Option ${i + 1} price`, { min: 0 });
    if (v._id && mongoose.isValidObjectId(v._id)) out._id = v._id; // keep ids so carts pointing at an option stay valid
    return out;
  });
};

const parseSpecs = (list) => {
  if (!Array.isArray(list)) throw new ApiError(400, 'Specifications must be a list');
  return list.slice(0, 30)
    .map((s) => ({ key: String(s?.key || '').trim().slice(0, 60), value: String(s?.value || '').trim().slice(0, 200) }))
    .filter((s) => s.key && s.value);
};

// Cleans product data from the admin form. With { partial: true } only the supplied fields are checked,
// so quick toggles (featured, hidden) can send just one field.
export const parseProductInput = (b = {}, { partial = false } = {}) => {
  const has = (k) => !partial || b[k] !== undefined;
  const out = {};
  if (has('name')) out.name = text(b.name, 'Name', { min: 2, max: 150 });
  if (has('sku')) out.sku = text(b.sku, 'SKU', { min: 2, max: 40 }).toUpperCase().replace(/\s+/g, '-');
  if (has('description')) out.description = text(b.description, 'Description', { min: 10, max: 5000 });
  if (has('category')) {
    if (!mongoose.isValidObjectId(b.category)) throw new ApiError(400, 'Please choose a category');
    out.category = b.category;
  }
  if (has('price')) out.price = num(b.price, 'Price', { min: 1 });
  if (b.discountPrice !== undefined) out.discountPrice = blank(b.discountPrice) ? null : num(b.discountPrice, 'Discount price', { min: 1 });
  if (has('stock')) out.stock = num(b.stock ?? 0, 'Stock', { integer: true });
  if (b.weight !== undefined) out.weight = blank(b.weight) ? null : num(b.weight, 'Weight', { min: 0 });
  if (b.variants !== undefined) out.variants = parseVariants(b.variants);
  if (b.specifications !== undefined) out.specifications = parseSpecs(b.specifications);
  if (b.authenticity !== undefined) out.authenticity = { verified: bool(b.authenticity?.verified), details: String(b.authenticity?.details || '').trim().slice(0, 500) };
  for (const k of ['isFeatured', 'isBestSeller', 'isActive']) if (b[k] !== undefined) out[k] = bool(b[k]);
  return out;
};
