import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Journal from './models/Journal.js';
import { subDays, format } from 'date-fns';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';

async function seedJournals() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing journals
    await Journal.deleteMany({});
    console.log('Cleared existing journals');

    const today = new Date();

    const dummyEntries = [
      {
        type: 'trade',
        symbol: 'BTCUSDT',
        pnl: 1250,
        content: 'Long at support breakout. Strong volume confirmed the move. Exit target reached at 68k.',
        mentalState: 'Confident and patient',
        date: today,
        user: '65e78a2d4f3b2c1d0e9f8a7b'
      },
      {
        type: 'note',
        content: 'Market is very choppy today. Decided not to trade and just observe. Good discipline.',
        mentalState: 'Calm',
        date: subDays(today, 1),
        user: '65e78a2d4f3b2c1d0e9f8a7b'
      },
      {
        type: 'trade',
        symbol: 'ETHUSDT',
        pnl: -420,
        content: 'Tried to short the resistance but got stopped out by a wick. Might have entered too early.',
        mentalState: 'Slightly frustrated',
        date: subDays(today, 2),
        user: '65e78a2d4f3b2c1d0e9f8a7b'
      },
      {
        type: 'trade',
        symbol: 'SOLUSDT',
        pnl: 850,
        content: 'Great scalp on the 15m timeframe. RSI was oversold and bounced perfectly.',
        mentalState: 'Focused',
        date: subDays(today, 3),
        user: '65e78a2d4f3b2c1d0e9f8a7b'
      },
      {
        type: 'note',
        content: 'Focusing on risk management this week. Goal is to keep losses small and let winners run.',
        mentalState: 'Disciplined',
        date: subDays(today, 4),
        user: '65e78a2d4f3b2c1d0e9f8a7b'
      }
    ];

    await Journal.insertMany(dummyEntries);
    console.log('Seeded journal entries successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedJournals();
