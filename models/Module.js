const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topicNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  estimatedMinutes: {
    type: Number,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  }
});

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    moduleNumber: {
      type: Number,
      required: true
    },
    slug: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true
    },
    estimatedMinutes: {
      type: Number,
      default: 20
    },
    content: {
      type: String,
      required: true
    },
    keyConcepts: [
      {
        type: String
      }
    ],
    topics: [topicSchema],
    order: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee unique module numbers per course
moduleSchema.index({ courseId: 1, moduleNumber: 1 }, { unique: true });

module.exports = mongoose.model('Module', moduleSchema);
