import Razorpay from 'razorpay';

export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let client;
// Created on first use, so the site still runs when payment keys are not set yet.
export const getRazorpay = () => {
  if (!razorpayConfigured()) return null;
  client ||= new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return client;
};
