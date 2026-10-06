import ApiError from '../utils/ApiError.js';

const parseDate = (v, label) => {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new ApiError(400, `${label} is not a valid date`);
  return d;
};
const money = (v, label, { min = 0 } = {}) => {
  const n = typeof v === 'string' ? Number(v.trim()) : v;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min) throw new ApiError(400, `${label} must be a number of at least ${min}`);
  return n;
};
const count = (v, label, { min = 0 } = {}) => {
  const n = money(v ?? min, label, { min });
  if (!Number.isInteger(n)) throw new ApiError(400, `${label} must be a whole number`);
  return n;
};

export const parseCouponInput = (b = {}) => {
  const code = String(b.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) throw new ApiError(400, 'Coupon code must be 3 to 20 letters, numbers, - or _');
  if (!['percent', 'fixed'].includes(b.discountType)) throw new ApiError(400, 'Choose percent or fixed discount');
  const discountValue = money(b.discountValue, 'Discount value', { min: 1 });
  if (b.discountType === 'percent' && discountValue > 100) throw new ApiError(400, 'A percent discount cannot be more than 100');

  const startsAt = parseDate(b.startsAt, 'Start date');
  const expiresAt = parseDate(b.expiresAt, 'Expiry date');
  if (startsAt && expiresAt && expiresAt <= startsAt) throw new ApiError(400, 'Expiry date must be after the start date');

  return {
    code,
    description: String(b.description || '').trim().slice(0, 200),
    discountType: b.discountType,
    discountValue,
    maxDiscount: b.discountType === 'percent' && b.maxDiscount ? money(b.maxDiscount, 'Maximum discount', { min: 1 }) : undefined,
    minOrderValue: money(b.minOrderValue ?? 0, 'Minimum order value'),
    startsAt,
    expiresAt,
    usageLimit: count(b.usageLimit, 'Usage limit'),
    perUserLimit: count(b.perUserLimit, 'Per-user limit', { min: 1 }) || 1,
    isActive: b.isActive === undefined ? true : b.isActive === true || b.isActive === 'true',
  };
};

export const parseCategoryInput = (b = {}) => {
  const name = String(b.name || '').trim();
  if (name.length < 2 || name.length > 60) throw new ApiError(400, 'Category name must be 2 to 60 characters');
  return {
    name,
    description: String(b.description || '').trim().slice(0, 500),
    parent: b.parent || null,
    sortOrder: count(b.sortOrder, 'Sort order'),
    isActive: b.isActive === undefined ? true : b.isActive === true || b.isActive === 'true',
  };
};

// Links must stay on our own site (no javascript: or external links in banners)
export const parseBannerInput = (b = {}) => {
  const title = String(b.title || '').trim();
  if (title.length < 2 || title.length > 80) throw new ApiError(400, 'Title must be 2 to 80 characters');
  const link = String(b.link || '').trim();
  if (link && !/^\/(?!\/)[\w\-./?=&%#]*$/.test(link)) throw new ApiError(400, 'Link must be a page on this site, like /shop or /category/rudraksh');
  return {
    title,
    subtitle: String(b.subtitle || '').trim().slice(0, 160),
    link,
    sortOrder: count(b.sortOrder, 'Sort order'),
    isActive: b.isActive === undefined ? true : b.isActive === true || b.isActive === 'true',
  };
};
