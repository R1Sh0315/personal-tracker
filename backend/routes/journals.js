import express from 'express';
import Journal from '../models/Journal.js';

const router = express.Router();

// Get all journal entries
router.get('/', async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new entry
router.post('/', async (req, res) => {
  const entry = new Journal({
    ...req.body,
    user: req.userId
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
    const result = await Journal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
