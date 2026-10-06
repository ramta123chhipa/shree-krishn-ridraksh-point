import Subscriber from '../models/Subscriber.js';
import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter  { email }
export const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!EMAIL_RX.test(email) || email.length > 120) throw new ApiError(400, 'Please enter a valid email address');
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  // Same reply for new and existing subscribers
  res.status(201).json({ success: true, message: 'Thank you for subscribing!' });
});

// POST /api/contact  { name, email, phone?, message }
export const sendMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name?.trim() || !EMAIL_RX.test(String(email || '').trim()) || !message?.trim()) {
    throw new ApiError(400, 'Name, a valid email and a message are required');
  }
  await ContactMessage.create({ name, email, phone, message });
  res.status(201).json({ success: true, message: 'Message received. We will get back to you soon.' });
});
