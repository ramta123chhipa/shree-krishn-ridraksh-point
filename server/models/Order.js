import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery',
  'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded',
];

// Everything in an order is a snapshot, so later edits to products or addresses never change past orders.
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    sku: String,
    image: String,
    variantLabel: String,
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const addressSnapshot = new mongoose.Schema(
  { fullName: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String, country: String },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    shippingAddress: { type: addressSnapshot, required: true },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shippingCharge: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    coupon: { code: String, description: String },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paidAt: Date,
    razorpayOrderId: { type: String, index: true, sparse: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
    statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now }, _id: false }],
    cancelledAt: Date,
    deliveredAt: Date,
    shipment: { courier: String, trackingId: String },
    returnRequest: {
      reason: String,
      status: { type: String, enum: ['requested', 'approved', 'rejected'] },
      requestedAt: Date,
      resolvedAt: Date,
    },
    refundLock: { type: Boolean, default: false }, // true while a refund call is in progress (prevents double refunds)
    // Set when an order that was already paid gets cancelled: the store must refund it (admin workflow, Phase 5)
    refundRequired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
