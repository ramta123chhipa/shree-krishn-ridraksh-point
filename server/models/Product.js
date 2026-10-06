import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "Medium (18-20 mm)"
  price: { type: Number, min: 0 },
  stock: { type: Number, min: 0, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: [{ url: String, publicId: String }],
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(v) {
          return v == null || v < this.price;
        },
        message: 'Discount price must be lower than the price',
      },
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    weight: { type: Number, min: 0 }, // grams
    variants: [variantSchema],
    specifications: [{ key: String, value: String }],
    authenticity: { verified: { type: Boolean, default: false }, details: String },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0, min: 0 }, // used for popularity sorting
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text search on name + description (used from Phase 2)
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
