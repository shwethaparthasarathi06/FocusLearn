const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      validate: [
        function (val) {
          return val.length === 4;
        },
        'Each question must have exactly 4 options'
      ],
      required: true
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      required: true
    }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      index: true
    },
    quizType: {
      type: String,
      enum: ['regular', 'redo'],
      default: 'regular',
      index: true
    },
    title: {
      type: String,
      required: true
    },
    passingScore: {
      type: Number,
      default: 6
    },
    totalQuestions: {
      type: Number,
      default: 10
    },
    questions: {
      type: [questionSchema],
      validate: [
        function (val) {
          return val.length === 10;
        },
        'Quiz must contain exactly 10 questions'
      ]
    }
  },
  {
    timestamps: true
  }
);

// Compound index allowing one regular quiz and one redo quiz per module
quizSchema.index({ moduleId: 1, quizType: 1 }, { unique: true });

module.exports = mongoose.model('Quiz', quizSchema);
