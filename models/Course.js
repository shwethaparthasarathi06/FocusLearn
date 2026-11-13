const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    durationHours: {
      type: Number,
      default: 3.0
    },
    lessonCount: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      default: 'Master of Computer Applications'
    },
    order: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Course', courseSchema);
