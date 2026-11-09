const mongoose = require('mongoose');

const pauseIntervalSchema = new mongoose.Schema(
  {
    pausedAt: {
      type: Date,
      required: true
    },
    resumedAt: {
      type: Date
    },
    durationSeconds: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true
    },
    plannedDurationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 180
    },
    actualDurationSeconds: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['in-progress', 'paused', 'break', 'completed', 'cancelled'],
      default: 'in-progress'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    pauseIntervals: [pauseIntervalSchema],
    totalPausedSeconds: {
      type: Number,
      default: 0
    },
    extendedMinutes: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
