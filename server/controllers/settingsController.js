import Setting from '../models/Setting.js';
import asyncHandler from '../utils/asyncHandler.js';
import { razorpayConfigured } from '../config/razorpay.js';
import { shippingConfig } from '../utils/calculatePrice.js';
import { requireVerifiedEmail } from '../services/orderService.js';

// GET /api/settings/public  -> what the storefront needs to show payment options and shipping text
export const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.get();
  const { freeAbove, charge } = shippingConfig();
  res.json({
    success: true,
    data: {
      codEnabled: settings.codEnabled,
      onlinePaymentsEnabled: razorpayConfigured(),
      freeShippingAbove: freeAbove,
      shippingCharge: charge,
      requireVerifiedEmail: requireVerifiedEmail(),
      returnWindowDays: Number(process.env.RETURN_WINDOW_DAYS) || 7,
    },
  });
});
