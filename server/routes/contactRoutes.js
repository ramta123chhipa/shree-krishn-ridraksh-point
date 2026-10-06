import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { subscribe, sendMessage } from '../controllers/contactController.js';

const router = Router();
// Public forms get a tighter limit to discourage spam
const formLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' } });

router.post('/newsletter', formLimiter, subscribe);
router.post('/contact', formLimiter, sendMessage);

export default router;
