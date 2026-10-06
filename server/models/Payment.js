import mongoose from 'mongoose';

// One record per Razorpay order / payment attempt. Card or UPI details never touch our server.
const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, enum: ['razorpay'], default: 'razorpay' },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true }, // rupees
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'captured', 'failed'], default: 'created' },
    failureReason: String,
    refunds: [{ refundId: String, amount: Number, status: String, at: Date, _id: false }], // filled by the admin refund workflow
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
