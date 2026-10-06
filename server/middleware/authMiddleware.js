import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Requires a logged-in user and puts it on req.user.
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies?.token || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) throw new ApiError(401, 'Please log in to continue');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or disabled');
  if (user.passwordChangedAt && Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat) {
    throw new ApiError(401, 'Password was changed. Please log in again');
  }

  req.user = user;
  next();
});
