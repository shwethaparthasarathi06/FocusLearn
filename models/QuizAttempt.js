const mongoose = require('mongoose');

const answerRecordSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    selectedOption: {
      type: Number, // 0-3, or -1 if unanswered
      default: -1
    },
    correctOption: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    explanation: {
      type: String
    }
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
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
    studySessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySession'
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    answers: [answerRecordSchema],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    totalQuestions: {
      type: Number,
      default: 10
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    passed: {
      type: Boolean,
      required: true
    },
    timeSpentSeconds: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
