/**
 * update-module-pdfs.js
 * Updates the DS course module order to: 
 *   1. Introduction to Data Structures  → Data_Structure.pdf
 *   2. Stacks and Queues               → Stack_Queue.pdf
 *   3. Linked Lists                    → Linked_List.pdf
 * And updates all topic pdfUrls within those modules to point to
 * the single whole-module PDF (as uploaded by the user).
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const Course = require('../models/Course');
const Module = require('../models/Module');

async function run() {
  await connectDB();

  // Find the DS course
  const course = await Course.findOne({ code: 'DS' });
  if (!course) { console.error('DS course not found'); process.exit(1); }
  console.log('Found DS course:', course.title);

  // Map: module slug → new moduleNumber + pdfUrl for all topics
  const updates = [
    { slug: 'introduction-to-data-structures', newNumber: 1, pdfUrl: '/materials/Data_Structure.pdf' },
    { slug: 'stacks-and-queues',               newNumber: 2, pdfUrl: '/materials/Stack_Queue.pdf'    },
    { slug: 'linked-list',                     newNumber: 3, pdfUrl: '/materials/Linked_List.pdf'    },
  ];

  for (const u of updates) {
    const mod = await Module.findOne({ courseId: course._id, slug: u.slug });
    if (!mod) { console.warn(`Module not found: ${u.slug}`); continue; }

    // Re-number module and update all topic pdfUrls to the single PDF
    mod.moduleNumber = u.newNumber;
    mod.topics = mod.topics.map(t => ({
      ...t.toObject(),
      pdfUrl: u.pdfUrl
    }));
    await mod.save();
    console.log(`✅ Updated Module ${u.newNumber}: "${mod.title}" → all topics → ${u.pdfUrl}`);
  }

  // Hide remaining modules (arrays, strings, trees, graphs, heaps) by setting moduleNumber high
  // so they don't appear before our 3 modules. Actually, just renumber them after 3.
  const remainingSlugs = ['arrays-and-strings', 'trees-and-graphs', 'heaps-hashing-complexity'];
  let nextNum = 4;
  for (const slug of remainingSlugs) {
    const mod = await Module.findOne({ courseId: course._id, slug });
    if (!mod) continue;
    mod.moduleNumber = nextNum++;
    await mod.save();
    console.log(`  Renumbered "${mod.title}" → Module ${mod.moduleNumber}`);
  }

  console.log('\nDone!');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
