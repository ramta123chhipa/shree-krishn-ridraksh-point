import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 20 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
