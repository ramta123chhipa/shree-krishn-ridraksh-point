import Address from '../models/Address.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendAuthCookie } from '../utils/generateToken.js';
import { checkName, checkPhone, checkPassword } from '../validators/authValidator.js';

const MAX_ADDRESSES = 10;
const ADDRESS_FIELDS = ['label', 'fullName', 'phone', 'line1', 'line2', 'city', 'state', 'pincode', 'isDefault'];

// PUT /api/users/profile  { name, phone }
export const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = checkName(req.body.name);
  req.user.phone = checkPhone(req.body.phone);
  await req.user.save();
  res.json({ success: true, data: req.user.toPublic() });
});

// PUT /api/users/password  { currentPassword, newPassword }
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(String(req.body.currentPassword || '')))) throw new ApiError(400, 'Current password is incorrect');
  user.password = checkPassword(req.body.newPassword);
  user.passwordChangedAt = new Date();
  await user.save();
  sendAuthCookie(res, user._id); // keep this device logged in; other sessions are signed out
  res.json({ success: true, message: 'Password changed' });
});

// Only whitelisted fields are copied from the request body.
const pickAddress = (body) => Object.fromEntries(ADDRESS_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const makeDefault = (userId, addressId) =>
  Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });

// GET /api/users/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const data = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 }).lean();
  res.json({ success: true, data });
});

// POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const count = await Address.countDocuments({ user: req.user._id });
  if (count >= MAX_ADDRESSES) throw new ApiError(400, `You can save up to ${MAX_ADDRESSES} addresses`);
  const address = await Address.create({ ...pickAddress(req.body), user: req.user._id, isDefault: count === 0 || req.body.isDefault === true });
  if (address.isDefault) await makeDefault(req.user._id, address._id);
  res.status(201).json({ success: true, data: address });
});

// PUT /api/users/addresses/:id
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw new ApiError(404, 'Address not found');
  const changes = pickAddress(req.body);
  if (changes.isDefault === false && address.isDefault) delete changes.isDefault; // one address must stay default
  address.set(changes);
  await address.save();
  if (address.isDefault) await makeDefault(req.user._id, address._id);
  res.json({ success: true, data: address });
});

// DELETE /api/users/addresses/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw new ApiError(404, 'Address not found');
  if (address.isDefault) {
    const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next) await Address.updateOne({ _id: next._id }, { isDefault: true });
  }
  res.json({ success: true, message: 'Address deleted' });
});
