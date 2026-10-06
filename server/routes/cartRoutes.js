import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);

export default router;
