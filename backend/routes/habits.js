import express from 'express';
import Habit from '../models/Habit.js';

const router = express.Router();

// Get all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  const habit = new Habit({
    user: req.userId,
    title: req.body.title,
    hasSubtasks: req.body.hasSubtasks,
    subtasks: req.body.subtasks || [],
    completions: {}
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle completion for a specific date and subtaskIndex
// subtaskIndex = -1 means the main habit (if no subtasks)
router.post('/:id/toggle', async (req, res) => {
  const { date, subtaskIndex } = req.body;
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const currentCompletions = habit.completions.get(date) || [];
    let newCompletions;

    if (currentCompletions.includes(subtaskIndex)) {
      newCompletions = currentCompletions.filter(idx => idx !== subtaskIndex);
    } else {
      newCompletions = [...currentCompletions, subtaskIndex];
    }

    habit.completions.set(date, newCompletions);
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const result = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
