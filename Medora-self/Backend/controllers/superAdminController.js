const User = require('../models/User');
const Record = require('../models/Record');
const OCRResult = require('../models/OCRResult');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const { pushNotification } = require('../utils/notificationHelper');

const userRoleFilter = { $or: [{ role: 'user' }, { role: { $exists: false } }] };

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, maleUsers, femaleUsers, otherGenderUsers] = await Promise.all([
      User.countDocuments(userRoleFilter),
      User.countDocuments({ ...userRoleFilter, gender: 'Male' }),
      User.countDocuments({ ...userRoleFilter, gender: 'Female' }),
      User.countDocuments({ ...userRoleFilter, gender: 'Other' }),
    ]);

    const [totalRecords, totalOCRs, totalPredictions] = await Promise.all([
      Record.countDocuments(),
      OCRResult.countDocuments(),
      Prediction.countDocuments(),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: {
          ...userRoleFilter,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      totalUsers,
      genderDistribution: [
        { label: 'Male', value: maleUsers },
        { label: 'Female', value: femaleUsers },
        { label: 'Other', value: otherGenderUsers },
      ],
      userGrowth,
      totalRecords,
      totalOCRs,
      totalPredictions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching dashboard stats', details: err.message });
  }
};

// PAGINATED USER LIST FOR ADMIN PANEL
exports.getUsersWithFilters = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;

    const query = { ...userRoleFilter };

    if (search) {
      const regex = new RegExp(search.replace(/[:]/g, '').trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
      ];
    }

    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('-passwordHash -googleId -resetPasswordToken -expoPushToken');

    const totalCount = await User.countDocuments(query);

    res.json({ users, totalCount });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users', details: err.message });
  }
};

// RECENT USERS
exports.getRecentUsers = async (req, res) => {
  try {
    const users = await User.find(userRoleFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-passwordHash -googleId -resetPasswordToken -expoPushToken');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recent users', details: err.message });
  }
};

// USER DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -googleId -resetPasswordToken -expoPushToken');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const [records, predictions, ocrResults] = await Promise.all([
      Record.find({ userId: user._id }),
      Prediction.find({ userId: user._id }),
      OCRResult.find({ userId: user._id }),
    ]);

    res.json({
      user,
      records: records.length,
      predictions: predictions.length,
      ocrResults: ocrResults.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user details', details: err.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await Promise.all([
      User.findByIdAndDelete(userId),
      Record.deleteMany({ userId }),
      Prediction.deleteMany({ userId }),
      OCRResult.deleteMany({ userId }),
    ]);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user', details: err.message });
  }
};

// UPDATE USER STATUS
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'pending', 'blocked'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: `User status updated to ${status}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user status', details: err.message });
  }
};

// FEEDBACKS
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching feedbacks', details: err.message });
  }
};

// NOTIFICATIONS
exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    const users = await User.find({
      ...userRoleFilter,
      expoPushToken: { $ne: null },
    }).select('_id expoPushToken');

    const notifications = await Promise.all(
      users.map(async (user) => {
        const notification = new Notification({
          userId: user._id,
          title,
          message,
          role: 'user',
        });

        await pushNotification(user.expoPushToken, title, message);
        return notification.save();
      })
    );

    res.json({
      message: `Notifications sent to ${notifications.length} users`,
      count: notifications.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error sending notifications', details: err.message });
  }
};


// RECORD COUNT FOR USER
exports.getUserRecordCount = async (req, res) => {
    try {
      const count = await Record.countDocuments({ userId: req.params.id });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching record count', details: err.message });
    }
  };
  
  // PREDICTION COUNT FOR USER
  exports.getUserPredictionCount = async (req, res) => {
    try {
      const count = await Prediction.countDocuments({ userId: req.params.id });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching prediction count', details: err.message });
    }
  };
  