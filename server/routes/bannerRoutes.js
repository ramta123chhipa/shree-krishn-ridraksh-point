import { Router } from 'express';
import { getBanners } from '../controllers/bannerController.js';

const router = Router();
router.get('/', getBanners);

export default router;
