import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    hasSubtasks: { type: Boolean, default: false },
    subtasks: [
      {
        title: { type: String, trim: true },
      }
    ],
    // completions tracks which habit/subtask was completed on which date
    // Format: { '2026-05-04': [subtaskIndex1, subtaskIndex2] } or { '2026-05-04': [-1] } for main habit
    completions: {
      type: Map,
      of: [Number],
      default: {}
    }
  },
  { timestamps: true }
);

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
