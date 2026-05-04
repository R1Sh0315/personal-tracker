import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Entry from './models/Entry.js';

dotenv.config();

const dummyEntries = [
  {
    title: 'Monthly Salary',
    category: 'salary',
    amount: 5000,
    type: 'income',
    notes: 'Base salary for the month of May',
  },
  {
    title: 'Grocery Shopping',
    category: 'groceries',
    amount: 150.75,
    type: 'expense',
    notes: 'Weekly groceries at Whole Foods',
  },
  {
    title: 'Gym Membership',
    category: 'health',
    amount: 45,
    type: 'expense',
    notes: 'Monthly subscription',
  },
  {
    title: 'Freelance Project',
    category: 'freelance',
    amount: 1200,
    type: 'income',
    notes: 'Website design project for local bakery',
  },
  {
    title: 'Electric Bill',
    category: 'utilities',
    amount: 85.20,
    type: 'expense',
    notes: 'Monthly electricity bill',
  },
  {
    title: 'Morning Run',
    category: 'exercise',
    amount: 0,
    type: 'health',
    notes: 'Ran 5k around the park in 25 mins',
  },
  {
    title: 'Dinner at Italian Restaurant',
    category: 'dining out',
    amount: 65,
    type: 'expense',
    notes: 'Dinner with friends',
  }
];

const seedEntries = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB. Seeding entries...');

    await Entry.insertMany(dummyEntries);
    
    console.log('Successfully added 7 dummy entries!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding entries:', error);
    process.exit(1);
  }
};

seedEntries();
