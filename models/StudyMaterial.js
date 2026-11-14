
const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
      index: true
    },
    topicNumber: { type: Number, default: null },

    materialType: {
      type: String,
      enum: ['PDF', 'Video', 'Link', 'Text'],
      required: true
    },

    materialUrl: {
      type: String,
      default: ''
    },

    content: {
      type: String,
      default: ''
    },

    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
