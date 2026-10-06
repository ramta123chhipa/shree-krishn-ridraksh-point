export default function Loader({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-maroon-700">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-400 border-t-maroon-700" />
      <span>{label}...</span>
    </div>
  );
}
