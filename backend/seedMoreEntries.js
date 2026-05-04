import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Entry from './models/Entry.js';

dotenv.config();

const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const dummyEntries = [
  // Today
  { title: 'Coffee', category: 'dining', amount: 5.50, type: 'expense', notes: 'Morning coffee', date: getPastDate(0) },
  { title: 'Freelance payment', category: 'freelance', amount: 300, type: 'income', notes: 'Logo design', date: getPastDate(0) },
  
  // Yesterday (1 day ago)
  { title: 'Groceries', category: 'food', amount: 80, type: 'expense', notes: 'Weekly groceries', date: getPastDate(1) },
  { title: 'Digital Gold SIP', category: 'investment', amount: 50, type: 'investment', notes: 'Monthly SIP', date: getPastDate(1) },
  { title: 'Movie Ticket', category: 'entertainment', amount: 15, type: 'expense', notes: 'Watched new release', date: getPastDate(1) },

  // 3 days ago
  { title: 'Electricity Bill', category: 'utilities', amount: 65, type: 'expense', notes: 'Monthly bill', date: getPastDate(3) },
  { title: 'Sold old bike', category: 'general', amount: 150, type: 'income', notes: 'Sold on craigslist', date: getPastDate(3) },

  // 1 week ago (7 days ago)
  { title: 'Mutual Fund SIP', category: 'investment', amount: 200, type: 'investment', notes: 'Index fund', date: getPastDate(7) },
  { title: 'Dinner at Steakhouse', category: 'dining', amount: 120, type: 'expense', notes: 'Anniversary dinner', date: getPastDate(7) },

  // 2 weeks ago (14 days ago)
  { title: 'Salary', category: 'salary', amount: 4000, type: 'income', notes: 'Bi-weekly salary', date: getPastDate(14) },
  { title: 'Rent', category: 'housing', amount: 1200, type: 'expense', notes: 'Monthly rent', date: getPastDate(14) },

  // 1 month ago (30 days ago)
  { title: 'Bonus', category: 'salary', amount: 1000, type: 'income', notes: 'Quarterly performance bonus', date: getPastDate(30) },
  { title: 'New Laptop', category: 'electronics', amount: 1500, type: 'expense', notes: 'Work laptop', date: getPastDate(30) },
  
  // 2 months ago (60 days ago)
  { title: 'Stocks purchase', category: 'investment', amount: 500, type: 'investment', notes: 'Bought tech stocks', date: getPastDate(60) },
  { title: 'Vacation Flight', category: 'travel', amount: 450, type: 'expense', notes: 'Flight to Hawaii', date: getPastDate(60) },
];

const seedEntries = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB. Seeding more entries with various dates...');

    // Optionally we can delete existing data to clean up, but appending is fine too.
    // await Entry.deleteMany({});
    
    await Entry.insertMany(dummyEntries);
    
    console.log(`Successfully added ${dummyEntries.length} dummy entries across multiple dates!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding entries:', error);
    process.exit(1);
  }
};

seedEntries();
