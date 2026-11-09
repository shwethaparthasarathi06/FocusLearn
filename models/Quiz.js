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
      unique: true
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

module.exports = mongoose.model('Quiz', quizSchema);
