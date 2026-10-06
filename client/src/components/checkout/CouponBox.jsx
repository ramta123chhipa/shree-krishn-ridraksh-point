import { useState } from 'react';

export default function CouponBox({ applied, error, busy, onApply, onRemove }) {
  const [code, setCode] = useState('');

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-md bg-saffron-50 p-3">
        <span>Coupon <strong>{applied}</strong> applied</span>
        <button type="button" onClick={onRemove} className="text-maroon-700 underline">Remove</button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" maxLength={30}
          className="w-full rounded-md border border-gold-400 bg-white px-4 py-2.5 outline-none focus:border-saffron-500" />
        <button type="button" disabled={busy || !code.trim()} onClick={() => onApply(code.trim())}
          className="rounded-md bg-maroon-700 px-5 text-cream-50 hover:bg-maroon-800 disabled:opacity-50">Apply</button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-maroon-700">{error}</p>}
    </div>
  );
}
