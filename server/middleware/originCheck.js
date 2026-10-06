import ApiError from '../utils/ApiError.js';

// CSRF defence for cookie auth: browsers always send an Origin header on cross-site writes,
// so a state-changing request from any site other than our frontend is refused.
export const originCheck = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  const allowed = process.env.CLIENT_URL || 'http://localhost:5173';
  if (origin && origin !== allowed) return next(new ApiError(403, 'Request origin not allowed'));
  next();
};
