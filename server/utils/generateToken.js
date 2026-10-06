import jwt from 'jsonwebtoken';

const DAYS = Number(process.env.JWT_EXPIRES_DAYS) || 7;
const isProd = () => process.env.NODE_ENV === 'production';

export const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: `${DAYS}d` });

// The token lives in an httpOnly cookie, so page scripts can never read it.
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  // Production frontend and API are on different domains, which needs SameSite=None (+ Secure).
  sameSite: isProd() ? 'none' : 'lax',
  path: '/',
});

export const sendAuthCookie = (res, userId) => {
  res.cookie('token', signToken(userId), { ...cookieOptions(), maxAge: DAYS * 24 * 60 * 60 * 1000 });
};

export const clearAuthCookie = (res) => res.clearCookie('token', cookieOptions());
