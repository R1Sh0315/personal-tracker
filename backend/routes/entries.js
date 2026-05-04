import express from 'express';
import Entry from '../models/Entry.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch entries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const entry = new Entry(req.body);
    const savedEntry = await entry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ error: 'Unable to update entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await Entry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete entry' });
  }
});

export default router;
