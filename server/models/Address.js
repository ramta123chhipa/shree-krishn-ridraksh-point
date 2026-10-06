import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 80 },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    line1: { type: String, required: [true, 'Address line 1 is required'], trim: true, maxlength: 150 },
    line2: { type: String, trim: true, maxlength: 150 },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    pincode: { type: String, required: [true, 'Pincode is required'], match: [/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'] },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Address', addressSchema);
