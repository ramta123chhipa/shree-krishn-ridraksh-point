import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { expireUnpaidOrders } from './services/orderService.js';

const PORT = process.env.PORT || 5000;

const checkEnv = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET is missing or too short (needs 32+ characters). Generate one with:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
        'and put it in server/.env as JWT_SECRET=...'
    );
  }
};

const start = async () => {
  try {
    checkEnv();
    await connectDB();
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
    // Every 10 minutes, cancel online orders that were never paid and give their stock back
    setInterval(() => expireUnpaidOrders().catch((e) => console.error('Order expiry failed:', e.message)), 10 * 60 * 1000).unref();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
