import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { validateRegister, validateLogin, checkEmail, checkPassword } from '../validators/authValidator.js';

// Used so a login for an unknown email takes about as long as a real one.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

// Email problems must not break the request that triggered them.
const safeSend = (fn) => fn().catch((err) => console.error('Email failed:', err.message));

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const data = validateRegister(req.body);
  if (await User.exists({ email: data.email })) throw new ApiError(409, 'An account with this email already exists');

  const user = new User(data);
  const token = user.createOneTimeToken('verify');
  await user.save();
  await safeSend(() => sendVerificationEmail(user, token));

  sendAuthCookie(res, user._id);
  res.status(201).json({ success: true, message: 'Account created. Please check your email to verify your address.', data: user.toPublic() });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);
  const user = await User.findOne({ email }).select('+password');
  const ok = user ? await user.matchPassword(password) : await bcrypt.compare(password, DUMMY_HASH).then(() => false);
  if (!ok) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'This account has been disabled. Please contact us.');

  sendAuthCookie(res, user._id);
  res.json({ success: true, data: user.toPublic() });
});

// POST /api/auth/logout
export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
export const getMe = (req, res) => res.json({ success: true, data: req.user.toPublic() });

// POST /api/auth/forgot-password  { email }
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = checkEmail(req.body.email);
  const user = await User.findOne({ email, isActive: true });
  if (user) {
    const token = user.createOneTimeToken('reset');
    await user.save({ validateBeforeSave: false });
    await safeSend(() => sendPasswordResetEmail(user, token));
  }
  // Same answer whether or not the account exists, so emails cannot be probed
  res.json({ success: true, message: 'If an account exists for that email, a reset link has been sent.' });
});

// POST /api/auth/reset-password  { token, password }
export const resetPassword = asyncHandler(async (req, res) => {
  const password = checkPassword(req.body.password);
  const token = String(req.body.token || '');
  const user = await User.findOne({
    resetPasswordToken: User.hashToken(token),
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw new ApiError(400, 'This reset link is invalid or has expired');

  user.password = password;
  user.passwordChangedAt = new Date();
  user.isEmailVerified = true; // they received the email, so the address is theirs
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendAuthCookie(res, user._id);
  res.json({ success: true, message: 'Password updated', data: user.toPublic() });
});

// POST /api/auth/verify-email  { token }   (POST so link scanners cannot use up the token)
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerifyToken: User.hashToken(String(req.body.token || '')),
    emailVerifyExpires: { $gt: Date.now() },
  }).select('+emailVerifyToken +emailVerifyExpires');
  if (!user) throw new ApiError(400, 'This verification link is invalid or has expired');

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Email verified' });
});

// POST /api/auth/resend-verification  (logged in)
export const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) throw new ApiError(400, 'Your email is already verified');
  const token = req.user.createOneTimeToken('verify');
  await req.user.save({ validateBeforeSave: false });
  await safeSend(() => sendVerificationEmail(req.user, token));
  res.json({ success: true, message: 'Verification email sent' });
});
