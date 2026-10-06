import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { uploadOneImage } from '../middleware/uploadMiddleware.js';
import {
  getDashboard, listCustomers, getCustomer, setCustomerStatus,
  listCoupons, createCoupon, updateCoupon, deleteCoupon, getSettings, updateSettings,
} from '../controllers/adminController.js';
import { listOrders, getOrder, updateStatus, refund } from '../controllers/adminOrderController.js';
import { adminGetProducts, adminGetProduct } from '../controllers/productController.js';
import { adminGetCategories } from '../controllers/categoryController.js';
import { adminGetBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';

const router = Router();
router.use(protect, adminOnly); // every route below needs a logged-in admin

router.get('/dashboard', getDashboard);

router.get('/products', adminGetProducts);
router.get('/products/:id', adminGetProduct);
router.get('/categories', adminGetCategories);

router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateStatus);
router.post('/orders/:id/refund', refund);

router.get('/customers', listCustomers);
router.get('/customers/:id', getCustomer);
router.patch('/customers/:id/status', setCustomerStatus);

router.route('/coupons').get(listCoupons).post(createCoupon);
router.route('/coupons/:id').put(updateCoupon).delete(deleteCoupon);

router.route('/banners').get(adminGetBanners).post(...uploadOneImage, createBanner);
router.route('/banners/:id').put(...uploadOneImage, updateBanner).delete(deleteBanner);

router.route('/settings').get(getSettings).patch(updateSettings);

export default router;
