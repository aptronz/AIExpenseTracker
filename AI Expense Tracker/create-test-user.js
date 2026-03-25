/**
 * Create test user in MongoDB
 * Usage: node create-test-user.js
 * Requires MongoDB running and MONGODB_URI (or default localhost)
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');
const User = require('./models/User');

async function createTestUser() {
  try {
    await connectDB();

    const email = 'test@example.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('✅ Test user already exists!');
      console.log('\n📧 Login Credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: test123');
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({
      username: 'Test User',
      email,
      password: hashedPassword
    });

    console.log('✅ Test user created in MongoDB!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');
    console.log('\n🚀 Start the server with: npm start');
    console.log('🌐 Then visit: http://localhost:3000');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

createTestUser();
