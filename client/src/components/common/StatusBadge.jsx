const COLORS = {
  Pending: 'bg-saffron-100 text-saffron-600',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-maroon-50 text-maroon-700',
  'Return Requested': 'bg-saffron-100 text-saffron-600',
  Returned: 'bg-cream-200 text-ink',
  Refunded: 'bg-cream-200 text-ink',
};

export default function StatusBadge({ status }) {
  return <span className={`inline-block rounded-full px-3 py-0.5 text-sm font-medium ${COLORS[status] || 'bg-cream-200 text-ink'}`}>{status}</span>;
}
