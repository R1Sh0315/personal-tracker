import express from 'express';
import Journal from '../models/Journal.js';

const router = express.Router();

// Get all journal entries
router.get('/', async (req, res) => {
  try {
    const entries = await Journal.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new entry
router.post('/', async (req, res) => {
  const entry = new Journal({
    type: req.body.type,
    content: req.body.content,
    date: req.body.date || new Date(),
    symbol: req.body.symbol,
    pnl: req.body.pnl,
    mentalState: req.body.mentalState,
    user: '65e78a2d4f3b2c1d0e9f8a7b' // Mock user ID (should come from auth)
  });

  try {
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an entry
router.delete('/:id', async (req, res) => {
  try {
    await Journal.findByIdAndDelete(req.id);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
