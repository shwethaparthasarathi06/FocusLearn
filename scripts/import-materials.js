const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const StudyMaterial = require('../models/StudyMaterial');
const Course = require('../models/Course');

const COURSE_FOLDER_MAP = {
  'AMCS': 'AMCS',
  'DS': 'DS',
  'OS': 'OS',
  'PDM': 'DBMS', // Principles of Database Management -> DBMS
  'SE': 'SE',
  'WAD': 'WAD'
};

function getMaterialType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (ext === '.ppt' || ext === '.pptx') return 'PPT';
  return null;
}

function cleanTitle(filename) {
  return path.parse(filename).name
    .replace(/\.docx$|\.pptx$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

async function runImport() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('[Import] MongoDB connected successfully.');

    // 1. Clear existing study materials as requested
    const deletedCount = await StudyMaterial.deleteMany({});
    console.log(`[Import] Removed ${deletedCount.deletedCount} existing materials.`);

    // 2. Read course folders from public/materials
    const materialsRoot = path.join(__dirname, '../public/materials');
    const dirents = await fs.promises.readdir(materialsRoot, { withFileTypes: true });

    let importedCount = 0;

    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue;
      const folderName = dirent.name;
      const targetCourseCode = COURSE_FOLDER_MAP[folderName] || folderName;

      const course = await Course.findOne({
        $or: [
          { code: new RegExp('^' + targetCourseCode + '$', 'i') },
          { code: new RegExp('^' + folderName + '$', 'i') }
        ]
      });

      if (!course) {
        console.warn(`[Import] Warning: No course found matching code "${targetCourseCode}" (folder: ${folderName})`);
        continue;
      }

      const folderPath = path.join(materialsRoot, folderName);
      const files = await fs.promises.readdir(folderPath);

      for (const file of files) {
        const type = getMaterialType(file);
        if (!type) continue;

        const title = cleanTitle(file);
        const materialUrl = `/materials/${folderName}/${file}`;

        await StudyMaterial.create({
          title,
          description: `${type} reference material for ${course.title}`,
          courseId: course._id,
          materialType: type,
          materialUrl,
          isPublished: true
        });

        console.log(`[Import] Added [${type}] "${title}" to course "${course.title}" (${course.code})`);
        importedCount++;
      }
    }

    // 3. Add AI Course YouTube Video
    const aiCourse = await Course.findOne({ code: /^AI$/i });
    if (aiCourse) {
      await StudyMaterial.create({
        title: 'Introduction to Artificial Intelligence & Neural Networks',
        description: 'Comprehensive video lecture on core AI algorithms, machine learning workflows, and neural network foundations.',
        courseId: aiCourse._id,
        materialType: 'Video',
        materialUrl: 'https://www.youtube.com/watch?v=SSE4M0gcmvE',
        isPublished: true
      });
      console.log(`[Import] Added [Video] AI YouTube lecture to "${aiCourse.title}" (${aiCourse.code})`);
      importedCount++;
    } else {
      console.warn('[Import] Warning: AI course not found in database.');
    }

    console.log(`\n========================================`);
    console.log(`[Import] Successfully imported ${importedCount} study materials across all courses!`);
    console.log(`========================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Import Error]:', err);
    process.exit(1);
  }
}

runImport();
