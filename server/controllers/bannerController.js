import mongoose from 'mongoose';
import Banner from '../models/Banner.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { parseBannerInput } from '../validators/adminValidator.js';

// GET /api/banners  (public: active banners for the home page)
export const getBanners = asyncHandler(async (req, res) => {
  const data = await Banner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(6).lean();
  res.json({ success: true, data });
});

// ---------- Admin ----------
const load = async (id) => {
  const banner = mongoose.isValidObjectId(id) ? await Banner.findById(id) : null;
  if (!banner) throw new ApiError(404, 'Banner not found');
  return banner;
};

export const adminGetBanners = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Banner.find().sort({ sortOrder: 1, createdAt: -1 }).lean() });
});

// POST /api/admin/banners  (multipart: image + title, subtitle, link, sortOrder, isActive)
export const createBanner = asyncHandler(async (req, res) => {
  const data = parseBannerInput(req.body);
  if (!req.file) throw new ApiError(400, 'Please choose a banner image');
  data.image = await uploadImage(req.file.buffer, 'banners');
  const banner = await Banner.create(data);
  res.status(201).json({ success: true, data: banner });
});

// PUT /api/admin/banners/:id  (image optional: send one to replace the old picture)
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await load(req.params.id);
  banner.set(parseBannerInput(req.body));
  let oldId;
  if (req.file) {
    oldId = banner.image.publicId;
    banner.image = await uploadImage(req.file.buffer, 'banners');
  }
  await banner.save();
  if (oldId) await deleteImage(oldId);
  res.json({ success: true, data: banner });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await load(req.params.id);
  await Banner.deleteOne({ _id: banner._id });
  await deleteImage(banner.image.publicId);
  res.json({ success: true, message: 'Banner deleted' });
});
