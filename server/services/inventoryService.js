import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

const stockUpdate = (item, direction) => {
  const n = item.quantity * direction;
  return item.variantId
    ? { $inc: { 'variants.$[v].stock': n, soldCount: -n } }
    : { $inc: { stock: n, soldCount: -n } };
};

// Gives stock back (cancelled order, failed payment, expired order).
export const restoreStock = async (items) => {
  for (const item of items) {
    const options = item.variantId ? { arrayFilters: [{ 'v._id': item.variantId }] } : {};
    await Product.updateOne({ _id: item.product }, stockUpdate(item, +1), options);
  }
};

// Takes stock for every line. Each update is atomic and only succeeds if enough stock is left,
// so two shoppers can never buy the last piece. If any line fails, earlier lines are put back.
export const reserveStock = async (items) => {
  const done = [];
  for (const item of items) {
    const filter = item.variantId
      ? { _id: item.product, isActive: true, variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } } }
      : { _id: item.product, isActive: true, stock: { $gte: item.quantity } };
    const update = item.variantId
      ? { $inc: { 'variants.$.stock': -item.quantity, soldCount: item.quantity } }
      : { $inc: { stock: -item.quantity, soldCount: item.quantity } };

    const res = await Product.updateOne(filter, update);
    if (res.modifiedCount === 0) {
      await restoreStock(done);
      throw new ApiError(409, `"${item.name}" is no longer available in the quantity you chose. Please review your cart.`);
    }
    done.push(item);
  }
};
