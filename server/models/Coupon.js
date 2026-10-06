import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 30 },
    description: { type: String, trim: true, maxlength: 200 },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 }, // percent (0-100) or rupees
    maxDiscount: { type: Number, min: 0 }, // cap for percent coupons (rupees)
    minOrderValue: { type: Number, min: 0, default: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    usageLimit: { type: Number, min: 0, default: 0 }, // total uses, 0 = unlimited
    usedCount: { type: Number, min: 0, default: 0 },
    perUserLimit: { type: Number, min: 1, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
