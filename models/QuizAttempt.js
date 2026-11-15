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
    options: {
      type: [String],
      default: []
    },
    selectedOptionText: {
      type: String,
      default: ''
    },
    correctOptionText: {
      type: String,
      default: ''
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
    },
    maxScore: {
      type: Number,
      default: 10
    },
    correctAnswersCount: {
      type: Number,
      default: 0
    },
    incorrectAnswersCount: {
      type: Number,
      default: 0
    },
    unansweredCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Method to ensure accurate count calculations even for legacy attempts
quizAttemptSchema.methods.getCalculatedCounts = function () {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  if (this.answers && Array.isArray(this.answers)) {
    this.answers.forEach(a => {
      if (a.selectedOption === -1) {
        unanswered += 1;
      } else if (a.isCorrect) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });
  }
  return {
    correct: (typeof this.correctAnswersCount === 'number' && this.correctAnswersCount > 0) ? this.correctAnswersCount : correct,
    incorrect: (typeof this.incorrectAnswersCount === 'number' && this.incorrectAnswersCount > 0) ? this.incorrectAnswersCount : incorrect,
    unanswered: (typeof this.unansweredCount === 'number' && this.unansweredCount > 0) ? this.unansweredCount : unanswered,
    maxScore: this.maxScore || this.totalQuestions || 10
  };
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
