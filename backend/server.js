import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import entriesRouter from './routes/entries.js';
import habitsRouter from './routes/habits.js';
import journalsRouter from './routes/journals.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';

try {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('MongoDB connection failed:', error);
  process.exit(1);
}

app.use('/api/entries', entriesRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/journals', journalsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'Personal Tracker API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
