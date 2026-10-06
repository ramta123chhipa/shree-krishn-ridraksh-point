import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import { originCheck } from './middleware/originCheck.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
// Behind a hosting proxy (Render etc.) the real client IP comes from X-Forwarded-For
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// Razorpay's webhook signature is computed over the exact raw bytes, so this route must be read raw (before express.json)
app.use('/api/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(originCheck);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Global rate limit; login and registration have stricter limits in their routes
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Shree Krishna Rudraksh Point API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
