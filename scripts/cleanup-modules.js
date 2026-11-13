/**
 * cleanup-modules.js
 * Removes all modules for the Data Structures (DS) course and inserts only the three
 * required modules, each with a single topic that points to the provided PDF.
 *
 * Run with: `node scripts/cleanup-modules.js`
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');

async function cleanup() {
  try {
    // Connect using the same DB logic as config/db.js
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to Atlas');

    // Find the DS course
    const dsCourse = await Course.findOne({ code: 'DS' });
    if (!dsCourse) {
      console.error('❌ DS course not found');
      process.exit(1);
    }

    // Delete any existing modules for this course
    const delResult = await Module.deleteMany({ courseId: dsCourse._id });
    console.log(`🗑️ Deleted ${delResult.deletedCount} existing modules`);

    // Define the three required modules
    const modules = [
      {
        moduleNumber: 1,
        title: 'Introduction to Data Structures',
        slug: 'introduction-to-data-structures',
        summary: 'Overview of data structures.',
        estimatedMinutes: 35,
        content: 'Intro content...',
        topics: [
          {
            topicNumber: 1,
            title: 'Data Structures Overview',
            estimatedMinutes: 5,
            pdfUrl: '/materials/Data_Structure.pdf'
          }
        ]
      },
      {
        moduleNumber: 2,
        title: 'Stacks and Queue',
        slug: 'stacks-and-queue',
        summary: 'LIFO/FIFO concepts and practical examples.',
        estimatedMinutes: 30,
        content: 'Stacks & Queue content...',
        topics: [
          {
            topicNumber: 1,
            title: 'Stacks & Queues Theory',
            estimatedMinutes: 5,
            pdfUrl: '/materials/Stack_Queue.pdf'
          }
        ]
      },
      {
        moduleNumber: 3,
        title: 'Linked List',
        slug: 'linked-list',
        summary: 'Singly & doubly linked lists, insertion & deletion.',
        estimatedMinutes: 30,
        content: 'Linked List content...',
        topics: [
          {
            topicNumber: 1,
            title: 'Linked List Fundamentals',
            estimatedMinutes: 5,
            pdfUrl: '/materials/Linked_List.pdf'
          }
        ]
      }
    ];

    // Insert the three modules, linking them to the DS course
    for (const mod of modules) {
      const newMod = new Module({
        courseId: dsCourse._id,
        ...mod
      });
      await newMod.save();
      console.log(`✅ Inserted module ${mod.moduleNumber}: ${mod.title}`);
    }

    console.log('✅ Cleanup complete. Only the three required modules now exist.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
    process.exit(1);
  }
}

cleanup();

