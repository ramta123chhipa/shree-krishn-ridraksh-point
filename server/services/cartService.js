import Cart from '../models/Cart.js';
import { MAX_QTY_PER_ITEM, resolveLine } from '../utils/calculatePrice.js';

export const PRODUCT_FIELDS = 'name slug sku price discountPrice stock variants images isActive';

// Builds the cart the client sees, using current prices and stock from the database.
// Also used at checkout, so what the shopper pays always comes from here.
export const buildCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product', PRODUCT_FIELDS);
  const empty = { items: [], itemCount: 0, subtotal: 0, hasIssues: false };
  if (!cart) return empty;

  let changed = false;
  const items = [];
  let subtotal = 0;
  let itemCount = 0;
  let hasIssues = false;

  for (const line of [...cart.items]) {
    const product = line.product;
    // Product deleted or hidden: drop the line
    if (!product || !product.isActive) { cart.items.pull(line._id); changed = true; continue; }

    let info;
    try { info = resolveLine(product, line.variantId); } catch { cart.items.pull(line._id); changed = true; continue; }

    const available = info.stock > 0;
    let quantity = line.quantity;
    let adjusted = false;
    if (available && quantity > Math.min(info.stock, MAX_QTY_PER_ITEM)) {
      quantity = Math.min(info.stock, MAX_QTY_PER_ITEM);
      line.quantity = quantity;
      changed = true;
      adjusted = true;
    }
    if (!available || adjusted) hasIssues = true;
    if (available) { subtotal += info.unitPrice * quantity; itemCount += quantity; }

    items.push({
      productId: product._id,
      variantId: line.variantId || null,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images?.[0]?.url || null,
      variantLabel: info.variant?.label || null,
      unitPrice: info.unitPrice,
      listPrice: info.listPrice,
      quantity,
      stock: info.stock,
      available,
      adjusted,
    });
  }

  if (changed) await cart.save();
  return { items, itemCount, subtotal, hasIssues };
};
