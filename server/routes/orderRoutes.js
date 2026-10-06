import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { quote, placeOrder, myOrders, getOrder, cancelMyOrder, returnMyOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const orderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many order attempts. Please wait a few minutes.' } });

router.use(protect);
router.post('/quote', quote);
router.post('/', orderLimiter, placeOrder);
router.get('/my-orders', myOrders); // must stay above '/:id'
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelMyOrder);
router.post('/:id/return', returnMyOrder);

export default router;
