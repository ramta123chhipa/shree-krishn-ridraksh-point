import { Router } from 'express';
import {
  getProducts, getSuggestions, getProduct,
  createProduct, updateProduct, deleteProduct, updateStock, addImages, removeImage, makePrimaryImage,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';

const router = Router();
router.get('/', getProducts);
router.get('/suggestions', getSuggestions); // must stay above /:idOrSlug
router.get('/:idOrSlug', getProduct);

// Admin only
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);
router.post('/:id/images', protect, adminOnly, ...uploadImages, addImages);
router.delete('/:id/images/:imageId', protect, adminOnly, removeImage);
router.patch('/:id/images/:imageId/primary', protect, adminOnly, makePrimaryImage);

export default router;
