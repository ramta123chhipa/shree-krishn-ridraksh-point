import ApiError from '../utils/ApiError.js';

// Use after `protect`. Used by the admin routes from Phase 5.
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};
