import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uniqueSlug } from '../utils/slugify.js';
import { parseCategoryInput } from '../validators/adminValidator.js';

// GET /api/categories  (public: active categories only)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, count: categories.length, data: categories });
});

// ---------- Admin (Phase 5) ----------
const loadCategory = async (id) => {
  const cat = mongoose.isValidObjectId(id) ? await Category.findById(id) : null;
  if (!cat) throw new ApiError(404, 'Category not found');
  return cat;
};

// Only two levels (category > sub-category), and a category cannot be its own parent.
const checkParent = async (parentId, selfId) => {
  if (!parentId) return null;
  if (!mongoose.isValidObjectId(parentId)) throw new ApiError(400, 'Invalid parent category');
  if (selfId && String(parentId) === String(selfId)) throw new ApiError(400, 'A category cannot be its own parent');
  const parent = await Category.findById(parentId);
  if (!parent) throw new ApiError(400, 'Parent category does not exist');
  if (parent.parent) throw new ApiError(400, 'Sub-categories cannot have their own sub-categories');
  if (selfId && (await Category.exists({ parent: selfId }))) throw new ApiError(400, 'This category has sub-categories, so it cannot become a sub-category itself');
  return parent._id;
};

// GET /api/admin/categories  (includes hidden ones, with product counts)
export const adminGetCategories = asyncHandler(async (req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]),
  ]);
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ success: true, data: categories.map((c) => ({ ...c, productCount: byId[String(c._id)] || 0 })) });
});

// POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const data = parseCategoryInput(req.body);
  data.parent = await checkParent(data.parent);
  data.slug = await uniqueSlug(Category, data.name);
  const category = await Category.create(data); // a duplicate name is rejected by the unique index (409)
  res.status(201).json({ success: true, data: category });
});

// PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await loadCategory(req.params.id);
  const data = parseCategoryInput(req.body);
  data.parent = await checkParent(data.parent, category._id);
  category.set(data); // slug stays the same so existing links keep working
  await category.save();
  res.json({ success: true, data: category });
});

// DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await loadCategory(req.params.id);
  if (await Category.exists({ parent: category._id })) throw new ApiError(409, 'Delete or move its sub-categories first');
  const n = await Product.countDocuments({ category: category._id });
  if (n > 0) throw new ApiError(409, `${n} product${n > 1 ? 's use' : ' uses'} this category. Move them first, or hide the category instead.`);
  await Category.deleteOne({ _id: category._id });
  res.json({ success: true, message: 'Category deleted' });
});
