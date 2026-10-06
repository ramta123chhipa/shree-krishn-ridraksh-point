import ApiError from './ApiError.js';

export const MAX_QTY_PER_ITEM = 10;

// Works out price and stock for one cart line from the product record (never from the client).
// - Product with variants: a variant must be chosen; its own price (if set) replaces the product price.
// - A discount price applies only to the base product price.
export const resolveLine = (product, variantId) => {
  const hasVariants = product.variants?.length > 0;
  let variant = null;

  if (hasVariants) {
    if (!variantId) throw new ApiError(400, 'Please choose an option for this product');
    variant = product.variants.find((v) => String(v._id) === String(variantId));
    if (!variant) throw new ApiError(400, 'Selected option is not available');
  }

  const listPrice = variant?.price != null ? variant.price : product.price;
  const onSale = !(variant?.price != null) && product.discountPrice != null && product.discountPrice < product.price;
  return {
    variant,
    listPrice,
    unitPrice: onSale ? product.discountPrice : listPrice,
    stock: variant ? variant.stock : product.stock,
  };
};

// ---------- order totals ----------
const round2 = (n) => Math.round(n * 100) / 100;
const envNumber = (name, fallback) => (Number.isFinite(Number(process.env[name])) && process.env[name] !== undefined && process.env[name] !== '' ? Number(process.env[name]) : fallback);

export const shippingConfig = () => ({ freeAbove: envNumber('FREE_SHIPPING_ABOVE', 999), charge: envNumber('SHIPPING_CHARGE', 79) });

export const calcShipping = (subtotal) => {
  const { freeAbove, charge } = shippingConfig();
  return subtotal <= 0 || subtotal >= freeAbove ? 0 : charge;
};

// Discount for a coupon on a subtotal. Shipping is never discounted.
export const couponDiscount = (coupon, subtotal) => {
  let d = coupon.discountType === 'percent' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.discountType === 'percent' && coupon.maxDiscount > 0) d = Math.min(d, coupon.maxDiscount);
  return round2(Math.min(d, subtotal));
};

export const buildPricing = (subtotal, discount = 0) => {
  const shippingCharge = calcShipping(subtotal);
  return { subtotal: round2(subtotal), discount: round2(discount), shippingCharge, total: round2(subtotal - discount + shippingCharge) };
};
