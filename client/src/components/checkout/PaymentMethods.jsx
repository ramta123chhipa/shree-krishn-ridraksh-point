// Shows only the payment options the store currently offers (decided by the server).
export default function PaymentMethods({ settings, value, onChange }) {
  const options = [
    settings.onlinePaymentsEnabled && { id: 'razorpay', title: 'Pay online', text: 'UPI, debit card, credit card or net banking through Razorpay' },
    settings.codEnabled && { id: 'cod', title: 'Cash on delivery', text: 'Pay in cash when your order arrives' },
  ].filter(Boolean);

  if (options.length === 0) {
    return <p role="alert" className="rounded-md bg-maroon-50 p-3 text-maroon-700">No payment method is available right now. Please try again later.</p>;
  }

  return (
    <fieldset>
      <legend className="sr-only">Payment method</legend>
      <div className="space-y-3">
        {options.map((o) => (
          <label key={o.id} className={`flex cursor-pointer gap-3 rounded-md border p-4 ${value === o.id ? 'border-maroon-700 bg-maroon-50' : 'border-gold-300'}`}>
            <input type="radio" name="payment" value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="mt-1 accent-maroon-700" />
            <span><span className="block font-semibold text-maroon-800">{o.title}</span><span className="text-ink/70">{o.text}</span></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
