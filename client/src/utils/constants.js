export const SITE_NAME = 'Shree Krishna Rudraksh Point';

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Rudraksh', to: '/category/rudraksh' },
  { label: 'Ratna', to: '/category/gemstones-ratna' },
  { label: 'Malas', to: '/category/rudraksh-mala' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

// Used on the home page until products are loaded from the API (Phase 2)
export const FEATURED_CATEGORIES = [
  { name: 'Rudraksh', slug: 'rudraksh', note: 'Ek Mukhi, Panch Mukhi, Gauri Shankar' },
  { name: 'Rudraksh Mala', slug: 'rudraksh-mala', note: '108+1 bead japa malas' },
  { name: 'Gemstones (Ratna)', slug: 'gemstones-ratna', note: 'Manik, Panna, Pukhraj, Neelam, Moti' },
  { name: 'Spiritual Accessories', slug: 'spiritual-accessories', note: 'Puja items and more' },
];

export const CONTACT = {
  email: 'rajuchhipa7425@gmail.com',
  phone: '+91 9829146757',
  address: 'shree krishna rudraksh point,sadar bazar ramsar,nasirabad,ajmer',
};

export const FAQS = [
  { q: 'How do I know the Rudraksh is genuine?', a: 'Each product page lists the mukhi, size and origin. Where a product has been verified, the page shows an authenticity note with the details.' },
  { q: 'How long does delivery take?', a: 'Orders are usually dispatched within 1-3 working days. Delivery time depends on your location. See the Shipping Policy for details.' },
  { q: 'Can I return a product?', a: 'Eligible items can be returned within the return window. Please read the Return & Refund Policy before ordering.' },
  { q: 'Which payment methods are accepted?', a: 'UPI, debit and credit cards through Razorpay, and cash on delivery where enabled. Online payments arrive in a later phase of this site.' },
  { q: 'Can I get help choosing a Rudraksh or gemstone?', a: 'Yes. Use the contact page to send us a message and we will get back to you.' },
];

// SAMPLE content for development. Replace with real customer feedback before launch.
export const SAMPLE_TESTIMONIALS = [
  { name: 'Sample customer', place: 'Jaipur', text: 'The mala was exactly as described and arrived well packed.' },
  { name: 'Sample customer', place: 'Delhi', text: 'Clear product details made it easy to pick the right mukhi.' },
  { name: 'Sample customer', place: 'Mumbai', text: 'Good communication and quick dispatch.' },
];

export const ORDER_STATUSES = [
  'Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery',
  'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded',
];
