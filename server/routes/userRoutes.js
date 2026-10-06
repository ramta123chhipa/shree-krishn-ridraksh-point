import { Router } from 'express';
import { updateProfile, changePassword, getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.route('/addresses').get(getAddresses).post(addAddress);
router.route('/addresses/:id').put(updateAddress).delete(deleteAddress);

export default router;
