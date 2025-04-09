const Notification = require('../models/Notification');
const { pushNotification } = require('../utils/notificationHelper');
const { getAgenda } = require('../config/db');

module.exports = async (notificationData) => {
  try {
    const agenda = getAgenda();
    const { userId, title, message, scheduledAt, reminderId } = notificationData;
    const delay = new Date(scheduledAt) - new Date();
    
    if (delay <= 0) {
      await pushNotification(userId, title, message);
      await Notification.findOneAndUpdate(
        { reminderId },
        { isSent: true, sentAt: new Date() }
      );
      return;
    }

    await agenda.schedule(scheduledAt, 'send notification', {
      userId,
      title,
      message,
      reminderId
    });

    await Notification.findOneAndUpdate(
      { reminderId },
      {
        userId,
        title,
        message,
        scheduledAt,
        reminderId,
        isSent: false
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};