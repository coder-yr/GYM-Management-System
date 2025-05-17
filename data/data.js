// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/Userr');
const Membership = require('../models/Membershipp');
const Payment = require('../models/Paymentt');
const Receipt = require('../models/Receiptt');

async function runSeeder() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany();
    await Membership.deleteMany();
    await Payment.deleteMany();
    await Receipt.deleteMany();

    // Hashed password for both users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    const admin = await User.create({
      username: 'admin_user',
      email: 'admin@gmail.com',
      password: hashedPassword,
      isAdmin: true,
      isActive: true
    });

    // Member user
    const member = await User.create({
      username: 'john_doe',
      email: 'john@gmail.com',
      password: hashedPassword,
      isAdmin: false,
      isActive: true
    });

    // Membership for the member
    const membership = await Membership.create({
      user: member._id,
      plan: 'Premium Plan',
      price: 999,
      durationMonths: 12,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12))
    });

    // Payment for the member
    const payment = await Payment.create({
      user: member._id,
      amount: 999,
      date: new Date(),
      receipt: 'receipt_001',
      membershipPlan: membership._id
    });

    // Receipt for the member
    await Receipt.create({
      userId: member._id,
      amount: 999,
      date: new Date(),
      membershipPlan: membership.plan,
      status: 'Paid'
    });

    console.log('✅ Sample data inserted successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error inserting sample data:', err);
    process.exit(1);
  }
}

runSeeder();
