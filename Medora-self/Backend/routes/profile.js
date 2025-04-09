const express = require('express');
const profileRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/profile
profileRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile/update
profileRouter.put('/update', authMiddleware, async (req, res) => {
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
    console.error('Error updating profile:', error);
    res.status(500).send({
      message: 'Error updating profile',
      error: error.message,
    });
  }
});

module.exports = profileRouter;