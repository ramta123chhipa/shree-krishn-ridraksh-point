import api from './api';
import { SITE_NAME } from '../utils/constants';

export const PAYMENT_CANCELLED = 'PAYMENT_CANCELLED';

const createPaymentOrder = (orderId) => api.post('/payments/create-order', { orderId }).then((r) => r.data.data);
const verifyPayment = (body) => api.post('/payments/verify', body).then((r) => r.data.data);

// Loads Razorpay's checkout script once.
let scriptPromise;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    s.onerror = () => { scriptPromise = null; reject(new Error('Could not load the payment window. Check your internet connection.')); };
    document.body.appendChild(s);
  });
  return scriptPromise;
};

// Opens Razorpay for an existing order. Resolves with the paid order after the SERVER has verified the
// payment signature. Rejects with PAYMENT_CANCELLED if the shopper closes the window.
export async function payForOrder(orderId) {
  await loadRazorpay();
  const init = await createPaymentOrder(orderId); // amount is decided by the server

  return new Promise((resolve, reject) => {
    let verifying = false;
    const rzp = new window.Razorpay({
      key: init.keyId,
      amount: init.amount,
      currency: init.currency,
      order_id: init.razorpayOrderId,
      name: SITE_NAME,
      description: `Order ${init.orderNumber}`,
      prefill: init.prefill,
      theme: { color: '#6B1424' },
      handler: async (response) => {
        verifying = true;
        try {
          resolve(await verifyPayment({
            orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }));
        } catch (err) { reject(err); }
      },
      modal: { ondismiss: () => { if (!verifying) reject(new Error(PAYMENT_CANCELLED)); } },
    });
    rzp.open();
  });
}
