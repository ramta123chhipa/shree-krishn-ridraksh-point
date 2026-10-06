import mongoose from 'mongoose';

// One document holding store-wide switches. The admin dashboard (Phase 5) edits it.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    codEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

settingSchema.statics.get = function get() {
  return this.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true, new: true });
};

export default mongoose.model('Setting', settingSchema);
