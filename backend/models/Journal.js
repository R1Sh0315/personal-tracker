import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'trade'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Market selection
  market: {
    type: String,
    enum: ['indian', 'forex'],
    default: 'indian'
  },
  // Trade specific fields
  symbol: {
    type: String,
    default: ''
  },
  pnl: {
    type: Number, // Gross P&L
    default: 0
  },
  netPnl: {
    type: Number, // P&L after charges
    default: 0
  },
  mentalState: {
    type: String,
    default: ''
  },
  // Indian Market Specific
  assetType: {
    type: String, // Equity, Options, Futures
    default: ''
  },
  indexName: {
    type: String, // Nifty50, Banknifty, etc.
    default: ''
  },
  optionType: {
    type: String, // CE, PE
    default: ''
  },
  strikePrice: {
    type: String,
    default: ''
  },
  charges: {
    brokerage: { type: Number, default: 0 },
    stt: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    exchangeTurnover: { type: Number, default: 0 },
    sebiTurnover: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }
  },
  // Forex Specific
  leverage: {
    type: String,
    default: ''
  },
  spread: {
    type: Number,
    default: 0
  },
  direction: {
    type: String, // Long, Short
    default: 'long'
  }
}, { timestamps: true });

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;
