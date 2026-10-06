// Usage: npm run create-admin -- "Your Name" you@example.com YourPassword1
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { checkName, checkEmail, checkPassword } from '../validators/authValidator.js';

try {
  const [, , nameArg, emailArg, passwordArg] = process.argv;
  if (!nameArg || !emailArg || !passwordArg) throw new Error('Usage: npm run create-admin -- "Name" email password');
  const name = checkName(nameArg);
  const email = checkEmail(emailArg);
  const password = checkPassword(passwordArg);

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.isEmailVerified = true;
    await existing.save();
    console.log(`${email} is now an admin`);
  } else {
    await User.create({ name, email, password, role: 'admin', isEmailVerified: true });
    console.log(`Admin created: ${email}`);
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
