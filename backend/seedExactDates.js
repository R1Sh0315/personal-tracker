import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Entry from './models/Entry.js';

dotenv.config();

const createDate = (year, month, day) => {
  // Month is 0-indexed in JS Date (0 = Jan, 4 = May)
  const d = new Date(year, month, day, 12, 0, 0); 
  return d;
};

const dummyEntries = [
  // May 4
  { title: 'Morning Coffee', category: 'dining', amount: 5, type: 'expense', notes: 'Starbucks', date: createDate(2026, 4, 4) },
  { title: 'Freelance Design', category: 'freelance', amount: 350, type: 'income', notes: 'Logo project', date: createDate(2026, 4, 4) },
  
  // May 3
  { title: 'Groceries', category: 'food', amount: 120, type: 'expense', notes: 'Weekly groceries', date: createDate(2026, 4, 3) },
  { title: 'Mutual Fund SIP', category: 'investment', amount: 100, type: 'investment', notes: 'Index fund', date: createDate(2026, 4, 3) },
  
  // May 2
  { title: 'Gas Station', category: 'transport', amount: 40, type: 'expense', notes: 'Filled up tank', date: createDate(2026, 4, 2) },
  { title: 'Sold Old Monitor', category: 'general', amount: 80, type: 'income', notes: 'Sold on marketplace', date: createDate(2026, 4, 2) },

  // May 1
  { title: 'Rent', category: 'housing', amount: 1200, type: 'expense', notes: 'May Rent', date: createDate(2026, 4, 1) },
  { title: 'Salary', category: 'salary', amount: 4500, type: 'income', notes: 'May Salary', date: createDate(2026, 4, 1) },
  { title: 'Digital Gold', category: 'investment', amount: 50, type: 'investment', notes: 'Monthly gold SIP', date: createDate(2026, 4, 1) },
];

const seedEntries = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB. Wiping existing entries and seeding specific dates...');

    await Entry.deleteMany({});
    await Entry.insertMany(dummyEntries);
    
    console.log(`Successfully wiped and added ${dummyEntries.length} dummy entries for May 4, 3, 2, and 1!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding entries:', error);
    process.exit(1);
  }
};

seedEntries();
