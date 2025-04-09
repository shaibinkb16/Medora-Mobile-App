const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Register User
exports.register = async (req, res) => {
  const { name, email, password, phoneNumber, dateOfBirth, gender, profileImageUrl } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, phoneNumber, dateOfBirth, gender, profileImageUrl });
    await user.save();

    // Send verification email
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationUrl = `http://192.168.162.200:5000/api/auth/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).send({ message: 'Failed to send verification email' });
    }

    res.status(201).send({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send({ message: 'Error registering user', error: error.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        // Redirect to error page with message
        return res.redirect(`${process.env.FRONTEND_URL}/emailVerificationFailed`);
      }
      user.isVerified = true;
      await user.save();
      
      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/emailVerification?verified=true`);
    } catch (error) {
      // Redirect to error page
      res.redirect(`${process.env.FRONTEND_URL}/emailVerificationFailed`);
    }
  };
  
  // In your routes file

// Google Authentication
// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name, isVerified: true });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    res.status(500).send({ message: 'Error with Google authentication', error });
  }
};

// Password Reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Email not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `http://192.168.162.200:8082/ResetPassword?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `You can reset your password by clicking the following link: ${resetUrl}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent');
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).send({ message: 'Failed to send password reset email' });
    }

    res.send({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).send({ message: 'Error sending password reset email', error });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.send({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error resetting password', error });
  }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ message: 'Invalid credentials' });
      }
  
      if (!user.isVerified) {
        return res.status(400).send({ message: 'Please verify your email before logging in' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // ✅ Return token + user details
      res.status(200).send({
        token,
        user: {
          id: user._id,
          name: user.name,                         // ✅ this is the key part
          email: user.email,
          profileImageUrl: user.profileImageUrl || null,
        },
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).send({ message: 'Error logging in', error });
    }
  };
  


// In your auth routes or controller
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId; // From authentication middleware
    const updateData = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(
        userId, 
        { $set: updateData }, 
        { new: true, select: '-passwordHash' }
      );
  
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      res.send(user);
    } catch (error) {
      res.status(500).send({ 
        message: 'Error updating profile', 
        error: error.message 
      });
    }
  };