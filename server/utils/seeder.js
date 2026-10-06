// Usage: npm run seed   |   npm run seed:destroy
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// [name, parent name | null]
const categoryDefs = [
  ['Rudraksh', null],
  ['Ek Mukhi Rudraksh', 'Rudraksh'],
  ['Panch Mukhi Rudraksh', 'Rudraksh'],
  ['Gauri Shankar Rudraksh', 'Rudraksh'],
  ['Rudraksh Mala', null],
  ['Gemstones (Ratna)', null],
  ['Ruby (Manik)', 'Gemstones (Ratna)'],
  ['Emerald (Panna)', 'Gemstones (Ratna)'],
  ['Yellow Sapphire (Pukhraj)', 'Gemstones (Ratna)'],
  ['Blue Sapphire (Neelam)', 'Gemstones (Ratna)'],
  ['Pearl (Moti)', 'Gemstones (Ratna)'],
  ['Spiritual Accessories', null],
];

// Sample products for development only. Prices and details are dummy data.
const productDefs = [
  { name: 'Ek Mukhi Rudraksh (Round)', cat: 'Ek Mukhi Rudraksh', sku: 'RUD-EK-001', price: 25000, discountPrice: 21999, stock: 3, weight: 2, featured: true, best: false },
  { name: 'Panch Mukhi Rudraksh (Single Bead)', cat: 'Panch Mukhi Rudraksh', sku: 'RUD-PM-001', price: 299, discountPrice: 249, stock: 120, weight: 1, featured: true, best: true },
  { name: 'Gauri Shankar Rudraksh', cat: 'Gauri Shankar Rudraksh', sku: 'RUD-GS-001', price: 4500, discountPrice: 3999, stock: 15, weight: 3, featured: true, best: false },
  { name: '5 Mukhi Rudraksh Mala (108+1 beads)', cat: 'Rudraksh Mala', sku: 'MAL-108-001', price: 1499, discountPrice: 1199, stock: 40, weight: 45, featured: false, best: true },
  { name: 'Natural Ruby (Manik) Ring Stone', cat: 'Ruby (Manik)', sku: 'GEM-RUB-001', price: 18000, discountPrice: 15500, stock: 6, weight: 1, featured: true, best: false },
  { name: 'Natural Emerald (Panna)', cat: 'Emerald (Panna)', sku: 'GEM-EME-001', price: 14000, stock: 8, weight: 1, featured: false, best: false },
  { name: 'Yellow Sapphire (Pukhraj)', cat: 'Yellow Sapphire (Pukhraj)', sku: 'GEM-YEL-001', price: 22000, discountPrice: 19800, stock: 5, weight: 1, featured: false, best: true },
  { name: 'Pearl (Moti) Silver Pendant', cat: 'Pearl (Moti)', sku: 'GEM-PRL-001', price: 2200, discountPrice: 1899, stock: 25, weight: 5, featured: false, best: false },
  { name: 'Copper Puja Kalash Set', cat: 'Spiritual Accessories', sku: 'ACC-KAL-001', price: 899, stock: 30, weight: 350, featured: false, best: false },
  { name: 'Do Mukhi Rudraksh', cat: 'Rudraksh', sku: 'RUD-DM-001', price: 599, discountPrice: 499, stock: 50, weight: 1, featured: false, best: false },
  { name: 'Teen Mukhi Rudraksh', cat: 'Rudraksh', sku: 'RUD-TM-001', price: 449, stock: 0, weight: 1, featured: false, best: false },
  { name: 'Rudraksh Mala with Silver Caps', cat: 'Rudraksh Mala', sku: 'MAL-SLV-001', price: 3499, discountPrice: 2999, stock: 10, weight: 55, featured: true, best: false },
  { name: 'Sphatik Crystal Mala', cat: 'Rudraksh Mala', sku: 'MAL-SPH-001', price: 1299, stock: 22, weight: 40, featured: false, best: false },
  { name: 'Blue Sapphire (Neelam) Loose Stone', cat: 'Blue Sapphire (Neelam)', sku: 'GEM-NEE-001', price: 28000, stock: 4, weight: 1, featured: false, best: false },
  { name: 'Pearl (Moti) Loose Stone', cat: 'Pearl (Moti)', sku: 'GEM-PRL-002', price: 3200, stock: 18, weight: 1, featured: false, best: false },
  { name: 'Rudraksh Wrist Band', cat: 'Spiritual Accessories', sku: 'ACC-WRB-001', price: 799, discountPrice: 649, stock: 35, weight: 20, featured: false, best: true },
  { name: 'Brass Diya Set', cat: 'Spiritual Accessories', sku: 'ACC-DIY-001', price: 499, stock: 60, weight: 200, featured: false, best: false },
];

// Fake dev data so sorting, rating filters and variants can be tried out.
// Real ratings come from the review system in Phase 6.
const extras = {
  'RUD-EK-001': { sold: 12, rating: [4.8, 9] },
  'RUD-PM-001': { sold: 240, rating: [4.6, 58] },
  'RUD-GS-001': { sold: 31, rating: [4.7, 14] },
  'MAL-108-001': { sold: 180, rating: [4.5, 41] },
  'GEM-RUB-001': { sold: 9, rating: [4.4, 6] },
  'GEM-EME-001': { sold: 11, rating: [4.2, 5] },
  'GEM-YEL-001': { sold: 22, rating: [4.6, 12] },
  'GEM-PRL-001': { sold: 47, rating: [4.3, 16] },
  'ACC-KAL-001': { sold: 26, rating: [4.0, 7] },
  'RUD-DM-001': { sold: 64, rating: [4.1, 10] },
  'RUD-TM-001': { sold: 40, rating: [3.9, 8] },
  'MAL-SLV-001': { sold: 15, rating: [4.9, 7] },
  'MAL-SPH-001': { sold: 38, rating: [4.2, 11] },
  'GEM-NEE-001': { sold: 5, rating: [4.5, 4] },
  'GEM-PRL-002': { sold: 29, rating: [4.4, 9] },
  'ACC-WRB-001': { sold: 120, rating: [4.3, 33] },
  'ACC-DIY-001': { sold: 52, rating: [4.1, 12] },
};
const malaVariants = [
  { label: '6 mm beads', price: 999, stock: 15 },
  { label: '8 mm beads', price: 1199, stock: 40 },
  { label: '10 mm beads', price: 1799, stock: 12 },
];

const importData = async () => {
  await Product.deleteMany();
  await Category.deleteMany();

  const byName = {};
  for (const [i, [name]] of categoryDefs.entries()) {
    byName[name] = await Category.create({ name, slug: slugify(name), sortOrder: i });
  }
  for (const [name, parent] of categoryDefs) {
    if (parent) await Category.updateOne({ _id: byName[name]._id }, { parent: byName[parent]._id });
  }

  await Product.insertMany(
    productDefs.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      sku: p.sku,
      description: `${p.name}. Sample development data - replace with real product details from the admin dashboard.`,
      category: byName[p.cat]._id,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      weight: p.weight,
      isFeatured: p.featured,
      isBestSeller: p.best,
      soldCount: extras[p.sku]?.sold ?? 0,
      ratings: extras[p.sku] ? { average: extras[p.sku].rating[0], count: extras[p.sku].rating[1] } : undefined,
      variants: p.sku === 'MAL-108-001' ? malaVariants : [],
      specifications: [{ key: 'Origin', value: 'Sample' }],
    }))
  );
  // Sample coupons for testing checkout (upsert: never deletes coupons you made yourself)
  const coupons = [
    { code: 'WELCOME10', description: '10% off (up to Rs. 500) on orders above Rs. 999', discountType: 'percent', discountValue: 10, maxDiscount: 500, minOrderValue: 999, perUserLimit: 1 },
    { code: 'FLAT100', description: 'Rs. 100 off on orders above Rs. 1,500', discountType: 'fixed', discountValue: 100, minOrderValue: 1500, perUserLimit: 3 },
  ];
  for (const c of coupons) await Coupon.updateOne({ code: c.code }, { $setOnInsert: c }, { upsert: true });
  console.log(`Seeded ${categoryDefs.length} categories and ${productDefs.length} products`);
};

const destroyData = async () => {
  await Product.deleteMany();
  await Category.deleteMany();
  console.log('Seed data removed');
};

try {
  await connectDB();
  if (process.argv.includes('--destroy')) await destroyData();
  else await importData();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
