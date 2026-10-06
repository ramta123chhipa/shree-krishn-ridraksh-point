import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { MAX_IMAGES_PER_PRODUCT } from '../middleware/uploadMiddleware.js';
import { parseProductInput } from '../validators/productValidator.js';
import { uniqueSlug } from '../utils/slugify.js';
import { effectiveStockExpr, lowStockThreshold } from '../utils/stock.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const num = (v) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : undefined);

// finalPrice = discountPrice when present, otherwise price (computed in the pipeline)
const SORTS = {
  newest: { createdAt: -1, _id: 1 },
  price_asc: { finalPrice: 1, _id: 1 },
  price_desc: { finalPrice: -1, _id: 1 },
  popularity: { soldCount: -1, _id: 1 },
  rating: { 'ratings.average': -1, 'ratings.count': -1, _id: 1 },
};

// A parent category (e.g. Rudraksh) also includes its sub-categories.
const getCategoryIds = async (slug) => {
  const cat = await Category.findOne({ slug: String(slug).toLowerCase(), isActive: true }).lean();
  if (!cat) return [];
  const children = await Category.find({ parent: cat._id, isActive: true }).select('_id').lean();
  return [cat._id, ...children.map((c) => c._id)];
};

// GET /api/products?search=&category=&minPrice=&maxPrice=&rating=&inStock=&onSale=&featured=&bestSeller=&sort=&page=&limit=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, rating, inStock, onSale, featured, bestSeller } = req.query;
  const sort = SORTS[req.query.sort] ? req.query.sort : 'newest';
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48);

  const match = { isActive: true };
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim().slice(0, 60)), 'i');
    match.$or = [{ name: rx }, { description: rx }, { sku: rx }];
  }
  if (category) match.category = { $in: await getCategoryIds(category) };
  if (num(rating)) match['ratings.average'] = { $gte: num(rating) };
  if (inStock === 'true') match.stock = { $gt: 0 };
  if (onSale === 'true') match.discountPrice = { $ne: null };
  if (featured === 'true') match.isFeatured = true;
  if (bestSeller === 'true') match.isBestSeller = true;

  const priceRange = {};
  if (num(req.query.minPrice) !== undefined) priceRange.$gte = num(req.query.minPrice);
  if (num(req.query.maxPrice) !== undefined) priceRange.$lte = num(req.query.maxPrice);

  const pipeline = [
    { $match: match },
    { $addFields: { finalPrice: { $ifNull: ['$discountPrice', '$price'] } } },
    ...(Object.keys(priceRange).length ? [{ $match: { finalPrice: priceRange } }] : []),
    {
      $facet: {
        items: [
          { $sort: SORTS[sort] },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
          { $addFields: { category: { $arrayElemAt: ['$category', 0] } } },
          { $project: { description: 0, specifications: 0, 'category.description': 0 } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await Product.aggregate(pipeline);
  const total = result.total[0]?.count ?? 0;

  res.json({
    success: true,
    data: result.items,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/products/suggestions?q=  (search-box dropdown)
export const getSuggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 60);
  if (q.length < 2) return res.json({ success: true, data: [] });
  const data = await Product.find({ isActive: true, name: new RegExp(escapeRegex(q), 'i') })
    .select('name slug price discountPrice')
    .sort({ soldCount: -1 })
    .limit(6)
    .lean();
  res.json({ success: true, data });
});

// GET /api/products/:idOrSlug  -> product + related products
export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const filter = mongoose.isValidObjectId(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug };

  const product = await Product.findOne({ ...filter, isActive: true }).populate('category', 'name slug parent').lean();
  if (!product) throw new ApiError(404, 'Product not found');

  const parent = product.category?.parent ? await Category.findById(product.category.parent).select('name slug').lean() : null;

  // Related = same category, most popular first (no machine learning needed)
  const related = await Product.find({ isActive: true, category: product.category._id, _id: { $ne: product._id } })
    .select('-description -specifications')
    .populate('category', 'name slug')
    .sort({ soldCount: -1, createdAt: -1 })
    .limit(4)
    .lean();

  res.json({ success: true, data: { product, parentCategory: parent, related } });
});

// =====================  Admin (Phase 5)  =====================

const loadProduct = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Product not found');
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const checkDiscount = (p) => {
  if (p.discountPrice != null && p.discountPrice >= p.price) throw new ApiError(400, 'Discount price must be lower than the price');
};

// GET /api/admin/products  (includes hidden products)
export const adminGetProducts = asyncHandler(async (req, res) => {
  const { search, category, stock, status } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const filter = {};
  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim().slice(0, 60)), 'i');
    filter.$or = [{ name: rx }, { sku: rx }];
  }
  if (category && mongoose.isValidObjectId(category)) filter.category = category;
  if (status === 'active') filter.isActive = true;
  if (status === 'hidden') filter.isActive = false;
  if (stock === 'out') filter.$expr = { $lte: [effectiveStockExpr, 0] };
  if (stock === 'low') filter.$expr = { $lte: [effectiveStockExpr, lowStockThreshold()] };

  const [data, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: { page, pages: Math.ceil(total / limit) || 1, total }, lowStockThreshold: lowStockThreshold() });
});

// GET /api/admin/products/:id
export const adminGetProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await loadProduct(req.params.id) });
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const data = parseProductInput(req.body);
  if (!(await Category.exists({ _id: data.category }))) throw new ApiError(400, 'That category does not exist');
  if (await Product.exists({ sku: data.sku })) throw new ApiError(409, 'Another product already uses this SKU');
  if (data.discountPrice === null) delete data.discountPrice;
  if (data.weight === null) delete data.weight;
  checkDiscount(data);
  data.slug = await uniqueSlug(Product, data.name);
  const product = await Product.create(data);
  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id  (send only the fields that changed)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await loadProduct(req.params.id);
  const data = parseProductInput(req.body, { partial: true });
  if (data.category && !(await Category.exists({ _id: data.category }))) throw new ApiError(400, 'That category does not exist');
  if (data.sku && data.sku !== product.sku && (await Product.exists({ sku: data.sku, _id: { $ne: product._id } }))) throw new ApiError(409, 'Another product already uses this SKU');

  for (const [key, value] of Object.entries(data)) product.set(key, value === null ? undefined : value); // null clears a field
  checkDiscount(product);
  await product.save(); // the web address (slug) stays the same, so existing links keep working
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await loadProduct(req.params.id);
  await Product.deleteOne({ _id: product._id });
  // Past orders keep their own copy of the product details. Carts and wishlists are tidied here.
  await Promise.all([
    Cart.updateMany({ 'items.product': product._id }, { $pull: { items: { product: product._id } } }),
    Wishlist.updateMany({ products: product._id }, { $pull: { products: product._id } }),
  ]);
  await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
  res.json({ success: true, message: 'Product deleted' });
});

// PATCH /api/products/:id/stock  { stock?, variants?: [{ _id, stock }] }
export const updateStock = asyncHandler(async (req, res) => {
  const product = await loadProduct(req.params.id);
  const whole = (v, label) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) throw new ApiError(400, `${label} must be a whole number, 0 or more`);
    return n;
  };
  if (req.body.stock !== undefined) product.stock = whole(req.body.stock, 'Stock');
  if (Array.isArray(req.body.variants)) {
    for (const v of req.body.variants) {
      const option = product.variants.id(v._id);
      if (!option) throw new ApiError(400, 'Unknown option');
      option.stock = whole(v.stock, `Stock for ${option.label}`);
    }
  }
  await product.save();
  res.json({ success: true, data: product });
});

// POST /api/products/:id/images  (multipart, field "images")
export const addImages = asyncHandler(async (req, res) => {
  const product = await loadProduct(req.params.id);
  const files = req.files || [];
  if (!files.length) throw new ApiError(400, 'Choose at least one image');
  if (product.images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new ApiError(400, `A product can have up to ${MAX_IMAGES_PER_PRODUCT} images (it has ${product.images.length})`);
  }

  const results = await Promise.allSettled(files.map((f) => uploadImage(f.buffer, 'products')));
  const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  if (uploaded.length !== files.length) {
    await Promise.all(uploaded.map((u) => deleteImage(u.publicId))); // all or nothing
    throw new ApiError(502, 'Image upload failed. Please try again.');
  }
  product.images.push(...uploaded);
  await product.save();
  res.status(201).json({ success: true, data: product });
});

// DELETE /api/products/:id/images/:imageId
export const removeImage = asyncHandler(async (req, res) => {
  const product = await loadProduct(req.params.id);
  const image = product.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, 'Image not found');
  const { publicId } = image;
  image.deleteOne();
  await product.save();
  await deleteImage(publicId);
  res.json({ success: true, data: product });
});

// PATCH /api/products/:id/images/:imageId/primary  (first image is the main photo)
export const makePrimaryImage = asyncHandler(async (req, res) => {
  const product = await loadProduct(req.params.id);
  const image = product.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, 'Image not found');
  const rest = product.images.filter((i) => String(i._id) !== String(image._id));
  product.images = [image, ...rest];
  await product.save();
  res.json({ success: true, data: product });
});
