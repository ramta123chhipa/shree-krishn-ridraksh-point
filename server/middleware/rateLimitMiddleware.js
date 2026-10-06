import rateLimit from 'express-rate-limit';

const message = { success: false, message: 'Too many attempts. Please try again in a few minutes.' };

// Login: only failed attempts count.
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false, message });

// Registration, forgot/reset password, verification emails.
export const sensitiveLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, message });
