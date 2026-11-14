require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');

async function createAdmin() {
  try {
    const dbInfo = await connectDB();

    // Do not create an admin in temporary in-memory storage.
    if (dbInfo.isMemory) {
      throw new Error(
        'Persistent MongoDB is required. Configure MONGODB_URI in your env file.'
      );
    }

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password || password.length < 8) {
      throw new Error(
        'Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters).'
      );
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log('Existing account successfully promoted to admin.');
    } else {
      user = new User({
        name,
        email,
        passwordHash: password,
        role: 'admin'
      });

      // The User model's pre-save hook hashes this password.
      await user.save();

      console.log('Admin account created successfully.');
    }

    console.log(`Admin email: ${user.email}`);
  } catch (error) {
    console.error('Admin creation failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();