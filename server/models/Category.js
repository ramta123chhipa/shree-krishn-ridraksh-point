import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 500 },
    image: { type: String, default: '' },
    // Sub-categories point to their parent (e.g. Ruby -> Gemstones)
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
