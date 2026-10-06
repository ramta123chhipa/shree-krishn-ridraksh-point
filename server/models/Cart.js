import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId }, // set when the product has variants
  quantity: { type: Number, required: true, min: 1 },
});

// Only ids and quantities are stored. Prices are always read from the product at request time.
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [itemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
