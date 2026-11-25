const mongoose = require('mongoose');

const completedModuleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    bestQuizScore: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const studentProgressSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    completedModules: [completedModuleSchema],
    totalStudyTimeSeconds: {
      type: Number,
      default: 0
    },
    isCourseCompleted: {
      type: Boolean,
      default: false
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date
    },
    // Course Redo Tracking (Max 1 redo allowed per course per student)
    redoCount: {
      type: Number,
      default: 0
    },
    maxRedoAllowed: {
      type: Number,
      default: 1
    },
    redoStatus: {
      type: String,
      enum: ['none', 'in-progress', 'completed'],
      default: 'none'
    },
    redoStartedAt: {
      type: Date
    },
    redoCompletedAt: {
      type: Date
    },
    completedRedoModules: [completedModuleSchema],
    redoCompletionPercentage: {
      type: Number,
      default: 0
    },
    isRedoCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Unique index to ensure one progress document per user per course
studentProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
