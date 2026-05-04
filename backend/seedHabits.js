import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Habit from './models/Habit.js';
import { format, subDays } from 'date-fns';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';

async function seedHabits() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing habits
    await Habit.deleteMany({});
    console.log('Cleared existing habits');

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const dayBeforeStr = format(subDays(new Date(), 2), 'yyyy-MM-dd');

    const habits = [
      {
        title: 'Gym 💪',
        hasSubtasks: false,
        subtasks: [],
        completions: new Map([
          [todayStr, [-1]],
          [yesterdayStr, [-1]],
          [dayBeforeStr, [-1]]
        ])
      },
      {
        title: 'Study 📚',
        hasSubtasks: true,
        subtasks: [
          { title: 'React' },
          { title: 'Node' }
        ],
        completions: new Map([
          [todayStr, [0]], // Completed React
          [yesterdayStr, [0, 1]], // Completed both
          [dayBeforeStr, [1]] // Completed Node
        ])
      }
    ];

    await Habit.insertMany(habits);
    console.log('Seeded habits successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedHabits();
