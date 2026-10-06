export const lowStockThreshold = () => (Number.isFinite(Number(process.env.LOW_STOCK_THRESHOLD)) && process.env.LOW_STOCK_THRESHOLD ? Number(process.env.LOW_STOCK_THRESHOLD) : 5);

// A product with options is as stocked as the sum of its options; otherwise use its own stock.
export const effectiveStockExpr = {
  $cond: [{ $gt: [{ $size: { $ifNull: ['$variants', []] } }, 0] }, { $sum: '$variants.stock' }, '$stock'],
};

export const effectiveStock = (p) => (p.variants?.length ? p.variants.reduce((n, v) => n + (v.stock || 0), 0) : p.stock);
