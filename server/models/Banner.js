import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 80 },
    subtitle: { type: String, trim: true, maxlength: 160 },
    image: { url: { type: String, required: true }, publicId: String },
    link: { type: String, trim: true, maxlength: 200 }, // site path like /shop?onSale=true
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
