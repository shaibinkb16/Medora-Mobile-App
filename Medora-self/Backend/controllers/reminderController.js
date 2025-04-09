const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const scheduleNotification = require('../workers/notificationScheduler');

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.userId })
      .sort({ remindAt: 1 })
      .lean();

    const formattedReminders = reminders.map(reminder => ({
      _id: reminder._id,
      title: reminder.title,
      message: reminder.message,
      type: reminder.type,
      date: new Date(reminder.remindAt).toLocaleDateString(),
      time: new Date(reminder.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      remindAt: reminder.remindAt,
      isCompleted: reminder.isCompleted,
    }));

    res.status(200).json(formattedReminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { title, message, type, remindAt } = req.body;
    if (!title || !remindAt) return res.status(400).json({ error: 'Title and reminder time are required' });

    const reminder = new Reminder({
      userId: req.user.userId,
      title,
      message: message || title,
      type: type || 'custom',
      remindAt: new Date(remindAt),
      isCompleted: false,
    });

    await reminder.save();
    await scheduleNotification({
      userId: req.user.userId,
      title: `Reminder: ${title}`,
      message: message || title,
      scheduledAt: new Date(remindAt),
      reminderId: reminder._id
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(400).json({ error: error.message || 'Invalid reminder data' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, remindAt, isCompleted } = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { title, message, type, remindAt, isCompleted },
      { new: true }
    );

    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

    if (!isCompleted) {
      await Notification.findOneAndUpdate(
        { reminderId: id },
        {
          userId: req.user.userId,
          title: `Reminder: ${title}`,
          message: message || title,
          scheduledAt: new Date(remindAt),
          reminderId: id,
          isSent: false
        },
        { upsert: true }
      );
      await scheduleNotification({
        userId: req.user.userId,
        title: `Reminder: ${title}`,
        message: message || title,
        scheduledAt: new Date(remindAt),
        reminderId: id
      });
    } else {
      await Notification.deleteMany({ reminderId: id });
    }

    res.status(200).json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(400).json({ error: 'Failed to update reminder' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Reminder.findOneAndDelete({ _id: id, userId: req.user.userId });
    await Notification.deleteMany({ reminderId: id });

    if (!deleted) return res.status(404).json({ error: 'Reminder not found' });
    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();

    const reminders = await Reminder.find({
      userId: req.user.userId,
      remindAt: { $gte: now },
      type: { $ne: 'Cycle' }  // Exclude cycle-related reminders
    }).sort({ remindAt: 1 });

    const formatted = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      time: new Date(reminder.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: reminder.type,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    res.status(500).json({ error: "Failed to load upcoming reminders" });
  }
};
