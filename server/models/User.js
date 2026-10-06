import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 20 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    // Only hashes of one-time tokens are stored, never the tokens themselves
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    // Tokens issued before this moment are rejected (logs out other sessions after a password change)
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// Creates a one-time token: the raw value goes in the email link, its hash goes in the database.
userSchema.methods.createOneTimeToken = function createOneTimeToken(kind) {
  const raw = crypto.randomBytes(32).toString('hex');
  if (kind === 'verify') {
    this.emailVerifyToken = hash(raw);
    this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;
  } else {
    this.resetPasswordToken = hash(raw);
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  }
  return raw;
};

userSchema.statics.hashToken = hash;

userSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
