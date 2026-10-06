import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter, sensitiveLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();
router.post('/register', sensitiveLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', sensitiveLimiter, forgotPassword);
router.post('/reset-password', sensitiveLimiter, resetPassword);
router.post('/verify-email', sensitiveLimiter, verifyEmail);
router.post('/resend-verification', sensitiveLimiter, protect, resendVerification);

export default router;
