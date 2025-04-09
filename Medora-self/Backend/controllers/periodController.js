const Period = require("../models/Period");
const Notification = require("../models/Notification");
const { pushNotification } = require("../utils/notificationHelper");

// Add/Update Period Data
exports.addOrUpdatePeriod = async (req, res) => {
  try {
    const { firstPeriodDate, cycleLength, periodLength, notificationPreferences } = req.body;
    const userId = req.user.userId;

    if (!firstPeriodDate || !cycleLength || !periodLength) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isNaN(cycleLength) || isNaN(periodLength)) {
      return res.status(400).json({ error: "Invalid cycle or period length" });
    }

    const startDate = new Date(firstPeriodDate);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Normalize dates to remove time variations
    startDate.setHours(0, 0, 0, 0);
    const nextPeriodDate = new Date(startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + Number(cycleLength));
    nextPeriodDate.setHours(0, 0, 0, 0);

    let period = await Period.findOne({ userId });

    if (period) {
      period.firstPeriodDate = startDate;
      period.cycleLength = Number(cycleLength);
      period.periodLength = Number(periodLength);
      period.nextPeriodDate = nextPeriodDate;
      period.notificationPreferences = notificationPreferences;
      period.history.push(startDate);
    } else {
      period = new Period({
        userId,
        firstPeriodDate: startDate,
        cycleLength: Number(cycleLength),
        periodLength: Number(periodLength),
        nextPeriodDate,
        notificationPreferences,
        history: [startDate],
      });
    }

    await period.save();

    try {
      await schedulePeriodNotifications(userId, nextPeriodDate, notificationPreferences);
    } catch (notificationError) {
      console.error("Notification scheduling failed:", notificationError);
    }

    res.status(200).json({ message: "Period data updated successfully", period });
  } catch (error) {
    console.error("Error updating period data:", error);
    res.status(500).json({ error: "Failed to update period data" });
  }
};

// Get Period History
exports.getPeriodHistory = async (req, res) => {
  try {
    const period = await Period.findOne({ userId: req.user.userId });

    if (!period) {
      return res.status(200).json({
        history: [],
        nextPeriodDate: null,
        cycleLength: null,
        periodLength: null,
      });
    }

    res.json({
      history: period.history,
      nextPeriodDate: period.nextPeriodDate,
      cycleLength: period.cycleLength,
      periodLength: period.periodLength,
    });
  } catch (error) {
    console.error("Failed to fetch period history:", error);
    res.status(500).json({ error: "Failed to fetch period history" });
  }
};

// Schedule Notifications
const schedulePeriodNotifications = async (userId, nextPeriodDate, preferences) => {
  try {
    const notifications = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextPeriodDate.setHours(0, 0, 0, 0);

    const daysUntilNextPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 3600 * 24));

    if (daysUntilNextPeriod < 0) {
      console.error("The next period date is in the past. Please update the period data.");
      return;
    }

    const addNotification = (daysBefore, title, message) => {
      if (preferences[daysBefore] && daysUntilNextPeriod >= parseInt(daysBefore)) {
        const notificationDate = new Date(nextPeriodDate);
        notificationDate.setDate(notificationDate.getDate() - parseInt(daysBefore));
        notifications.push({ userId, title, message, date: notificationDate });
      }
    };

    addNotification("7", "Upcoming Period", "Your period is expected in 1 week. Stay prepared!");
    addNotification("3", "Upcoming Period", "Your period is expected in 3 days.");
    addNotification("1", "Upcoming Period", "Your period is expected tomorrow.");

    if (preferences.onStartDate && daysUntilNextPeriod === 0) {
      notifications.push({ userId, title: "Period Started", message: "Your period starts today. Take care!", date: nextPeriodDate });
    }

    await Notification.insertMany(notifications);

    for (const notif of notifications) {
      const timeUntilNotification = notif.date.getTime() - today.getTime();

      if (timeUntilNotification > 0) {
        await pushNotification(userId, notif.title, notif.message, timeUntilNotification);
      } else {
        console.log(`Notification for ${notif.title} not scheduled (past date).`);
      }
    }
  } catch (error) {
    console.error("Notification scheduling failed:", error);
  }
};

// Update Period Start Date
exports.updatePeriodStartDate = async (req, res) => {
  try {
    const { newStartDate } = req.body;
    const userId = req.user.userId;

    if (!newStartDate) {
      return res.status(400).json({ error: "Missing new start date" });
    }

    const newPeriodStartDate = new Date(newStartDate);
    if (isNaN(newPeriodStartDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    newPeriodStartDate.setHours(0, 0, 0, 0);

    const period = await Period.findOne({ userId });
    if (!period) return res.status(404).json({ error: "No period data found" });

    period.history.push(newPeriodStartDate);

    const updatedNextPeriodDate = new Date(newPeriodStartDate);
    updatedNextPeriodDate.setDate(updatedNextPeriodDate.getDate() + Number(period.cycleLength));
    updatedNextPeriodDate.setHours(0, 0, 0, 0);

    period.nextPeriodDate = updatedNextPeriodDate;
    await period.save();

    try {
      await Notification.deleteMany({ userId, title: { $in: ["Upcoming Period", "Period Started"] } });
      await schedulePeriodNotifications(userId, updatedNextPeriodDate, period.notificationPreferences);
    } catch (notificationError) {
      console.error("Notification update failed:", notificationError);
    }

    res.json({ message: "Period date updated successfully", nextPeriodDate: updatedNextPeriodDate });
  } catch (error) {
    console.error("Error updating period date:", error);
    res.status(500).json({ error: "Failed to update period date" });
  }
};
