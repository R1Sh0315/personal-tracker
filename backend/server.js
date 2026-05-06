import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import entriesRouter from './routes/entries.js';
import habitsRouter from './routes/habits.js';
import journalsRouter from './routes/journals.js';
import authRouter from './routes/auth.js';
import auth from './middleware/auth.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use('/api/auth', authRouter);
app.use('/api/entries', auth, entriesRouter);
app.use('/api/habits', auth, habitsRouter);
app.use('/api/journals', auth, journalsRouter);

// Serve static files from the React frontend app
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle any requests that don't match the API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
