const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ✅ Replace with your actual Mongo URI
const MONGO_URI = 'mongodb+srv://shaibinkb16:kl43e4175@medora.mj4rv.mongodb.net/?retryWrites=true&w=majority&appName=Medora';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// ✅ Create Super Admin Function
const createSuperAdmin = async ({ name, email, password }) => {
  try {
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('⚠️ Super admin already exists with this email.');
      process.exit();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newSuperAdmin = new User({
      name,
      email,
      passwordHash,
      role: 'superadmin',
      isAdminVerified: true,
      status: 'active',
      isVerified: true,
    });

    await newSuperAdmin.save();
    console.log('✅ Super admin created successfully!');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

// 👇🏽 Replace with superadmin details or prompt from CLI
const newAdmin = {
  name: 'Shaibin K B',
  email: 'shaibinkb@gmail.com',
  password: 'SHAIBIN', // Change this securely before running!
};

(async () => {
  await connectDB();
  await createSuperAdmin(newAdmin);
})();
