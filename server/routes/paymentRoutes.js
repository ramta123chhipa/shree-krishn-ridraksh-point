import { Router } from 'express';
import { createPaymentOrder, verifyPayment, webhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/webhook', webhook); // called by Razorpay: no login, protected by its signature
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);

export default router;
