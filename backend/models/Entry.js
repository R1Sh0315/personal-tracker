import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'general', trim: true },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    type: {
      type: String,
      enum: ['expense', 'income', 'health', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
);

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
